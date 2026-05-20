#![no_std]

//! FundX Escrow — Stellar/Soroban port of FundXEscrow.sol
//!
//! Storage layout:
//! - Instance: Owner, CampaignCount, AllowedToken(addr)
//! - Persistent: Campaign(id), Donation(id, donor)
//!
//! Funding models:
//! - 0 = Flexible — creator can withdraw any time after deadline
//! - 1 = All-or-Nothing — refunds issued if goal not met; creator can only
//!   withdraw if goal reached
//!
//! Platform fee: 2% (200 bps) deducted on creator withdraw.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

// =========================================================
// CONSTANTS
// =========================================================

const FLEXIBLE: u32 = 0;
const ALL_OR_NOTHING: u32 = 1;
const PLATFORM_FEE_BPS: i128 = 200;
const BPS_DENOMINATOR: i128 = 10000;

// =========================================================
// ERRORS
// =========================================================

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotOwner = 3,
    NotFound = 4,
    NotCreator = 5,
    Inactive = 6,
    Expired = 7,
    StillActive = 8,
    GoalNotReached = 9,
    GoalReached = 10,
    AlreadyWithdrawn = 11,
    InvalidAmount = 12,
    InvalidModel = 13,
    NoDonation = 14,
    TokenNotAllowed = 15,
    NotAON = 16,
}

// =========================================================
// TYPES
// =========================================================

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub creator: Address,
    pub token: Address,
    pub goal: i128,
    pub deadline: u64,
    pub total_raised: i128,
    pub withdrawn: bool,
    pub active: bool,
    pub funding_model: u32,
}

#[contracttype]
pub enum DataKey {
    Owner,
    CampaignCount,
    Campaign(u32),
    Donation(u32, Address),
    AllowedToken(Address),
}

// =========================================================
// EVENTS
// =========================================================

fn evt_created(env: &Env, id: u32, creator: &Address, token: &Address, goal: i128, deadline: u64) {
    let topics = (Symbol::new(env, "campaign_created"), id);
    env.events().publish(topics, (creator.clone(), token.clone(), goal, deadline));
}

fn evt_donation(env: &Env, id: u32, donor: &Address, amount: i128) {
    let topics = (Symbol::new(env, "donation_received"), id);
    env.events().publish(topics, (donor.clone(), amount));
}

fn evt_withdraw(env: &Env, id: u32, creator: &Address, net: i128, fee: i128) {
    let topics = (Symbol::new(env, "funds_withdrawn"), id);
    env.events().publish(topics, (creator.clone(), net, fee));
}

fn evt_refund(env: &Env, id: u32, donor: &Address, amount: i128) {
    let topics = (Symbol::new(env, "refund_claimed"), id);
    env.events().publish(topics, (donor.clone(), amount));
}

// =========================================================
// CONTRACT
// =========================================================

#[contract]
pub struct FundXContract;

#[contractimpl]
impl FundXContract {
    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    pub fn initialize(env: Env, owner: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::CampaignCount, &0u32);
        Ok(())
    }

    pub fn set_allowed_token(env: Env, token: Address, allowed: bool) -> Result<(), Error> {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)?;
        owner.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::AllowedToken(token), &allowed);
        Ok(())
    }

    pub fn deactivate_campaign(env: Env, id: u32) -> Result<(), Error> {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)?;
        owner.require_auth();
        let mut c = Self::get_campaign(env.clone(), id)?;
        c.active = false;
        env.storage().persistent().set(&DataKey::Campaign(id), &c);
        Ok(())
    }

    // -----------------------------------------------------
    // READ-ONLY
    // -----------------------------------------------------

    pub fn get_campaign(env: Env, id: u32) -> Result<Campaign, Error> {
        env.storage()
            .persistent()
            .get::<_, Campaign>(&DataKey::Campaign(id))
            .ok_or(Error::NotFound)
    }

    pub fn get_donation(env: Env, id: u32, donor: Address) -> i128 {
        env.storage()
            .persistent()
            .get::<_, i128>(&DataKey::Donation(id, donor))
            .unwrap_or(0)
    }

    pub fn campaign_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }

    pub fn is_past_deadline(env: Env, id: u32) -> Result<bool, Error> {
        let c = Self::get_campaign(env.clone(), id)?;
        Ok(env.ledger().timestamp() >= c.deadline)
    }

    pub fn is_goal_reached(env: Env, id: u32) -> Result<bool, Error> {
        let c = Self::get_campaign(env, id)?;
        Ok(c.total_raised >= c.goal)
    }

    pub fn calculate_fee(amount: i128) -> i128 {
        (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR
    }

    pub fn calculate_net(amount: i128) -> i128 {
        amount - Self::calculate_fee(amount)
    }

    pub fn is_token_allowed(env: Env, token: Address) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::AllowedToken(token))
            .unwrap_or(false)
    }

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    pub fn create_campaign(
        env: Env,
        creator: Address,
        token: Address,
        goal: i128,
        duration: u64,
        funding_model: u32,
    ) -> Result<u32, Error> {
        creator.require_auth();

        if goal <= 0 {
            return Err(Error::InvalidAmount);
        }
        if duration == 0 {
            return Err(Error::InvalidAmount);
        }
        if funding_model != FLEXIBLE && funding_model != ALL_OR_NOTHING {
            return Err(Error::InvalidModel);
        }
        if !Self::is_token_allowed(env.clone(), token.clone()) {
            return Err(Error::TokenNotAllowed);
        }

        let prev: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        let id = prev;
        let deadline = env.ledger().timestamp() + duration;

        let campaign = Campaign {
            creator: creator.clone(),
            token: token.clone(),
            goal,
            deadline,
            total_raised: 0,
            withdrawn: false,
            active: true,
            funding_model,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Campaign(id), &campaign);
        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &(prev + 1));

        evt_created(&env, id, &creator, &token, goal, deadline);
        Ok(id)
    }

    // -----------------------------------------------------
    // DONATE
    // -----------------------------------------------------

    pub fn donate(env: Env, donor: Address, id: u32, amount: i128) -> Result<(), Error> {
        donor.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut c = Self::get_campaign(env.clone(), id)?;
        if !c.active {
            return Err(Error::Inactive);
        }
        if env.ledger().timestamp() >= c.deadline {
            return Err(Error::Expired);
        }
        if c.funding_model == ALL_OR_NOTHING && c.total_raised >= c.goal {
            return Err(Error::GoalReached);
        }

        // Pull tokens from donor into contract
        let contract_addr = env.current_contract_address();
        let token_client = token::Client::new(&env, &c.token);
        token_client.transfer(&donor, &contract_addr, &amount);

        // Update donation map
        let prev_donation: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Donation(id, donor.clone()))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::Donation(id, donor.clone()), &(prev_donation + amount));

        // Update campaign totals
        c.total_raised += amount;
        env.storage().persistent().set(&DataKey::Campaign(id), &c);

        evt_donation(&env, id, &donor, amount);
        Ok(())
    }

    // -----------------------------------------------------
    // WITHDRAW (creator)
    // -----------------------------------------------------

    pub fn withdraw(env: Env, id: u32) -> Result<(), Error> {
        let mut c = Self::get_campaign(env.clone(), id)?;
        c.creator.require_auth();

        if !c.active {
            return Err(Error::Inactive);
        }
        if env.ledger().timestamp() < c.deadline {
            return Err(Error::StillActive);
        }
        if c.withdrawn {
            return Err(Error::AlreadyWithdrawn);
        }
        if c.funding_model == ALL_OR_NOTHING && c.total_raised < c.goal {
            return Err(Error::GoalNotReached);
        }

        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)?;

        let total = c.total_raised;
        let fee = Self::calculate_fee(total);
        let net = total - fee;

        let contract_addr = env.current_contract_address();
        let token_client = token::Client::new(&env, &c.token);

        if fee > 0 {
            token_client.transfer(&contract_addr, &owner, &fee);
        }
        if net > 0 {
            token_client.transfer(&contract_addr, &c.creator, &net);
        }

        c.withdrawn = true;
        env.storage().persistent().set(&DataKey::Campaign(id), &c);

        evt_withdraw(&env, id, &c.creator, net, fee);
        Ok(())
    }

    // -----------------------------------------------------
    // CLAIM REFUND (donor, AON only, goal not reached)
    // -----------------------------------------------------

    pub fn claim_refund(env: Env, donor: Address, id: u32) -> Result<(), Error> {
        donor.require_auth();

        let c = Self::get_campaign(env.clone(), id)?;

        if env.ledger().timestamp() < c.deadline {
            return Err(Error::StillActive);
        }
        if c.funding_model != ALL_OR_NOTHING {
            return Err(Error::NotAON);
        }
        if c.total_raised >= c.goal {
            return Err(Error::GoalReached);
        }

        let donated: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Donation(id, donor.clone()))
            .unwrap_or(0);
        if donated == 0 {
            return Err(Error::NoDonation);
        }

        // Zero out donation before transfer (reentrancy safety)
        env.storage()
            .persistent()
            .set(&DataKey::Donation(id, donor.clone()), &0i128);

        let contract_addr = env.current_contract_address();
        let token_client = token::Client::new(&env, &c.token);
        token_client.transfer(&contract_addr, &donor, &donated);

        evt_refund(&env, id, &donor, donated);
        Ok(())
    }
}

#[cfg(test)]
mod test;
