#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    Env,
};

const FLEXIBLE: u32 = 0;
const ALL_OR_NOTHING: u32 = 1;

fn setup() -> (Env, FundXContractClient<'static>, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let alice = Address::generate(&env); // creator
    let bob = Address::generate(&env); // donor

    // Deploy a mock SAC token
    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token = token_contract_id.address();

    // Deploy FundX
    let contract_id = env.register(FundXContract, ());
    let client = FundXContractClient::new(&env, &contract_id);

    client.initialize(&owner);
    client.set_allowed_token(&token, &true);

    // Mint tokens to bob
    let mint_client = StellarAssetClient::new(&env, &token);
    mint_client.mint(&bob, &10_000i128);

    (env, client, owner, alice, bob, token)
}

#[test]
fn test_create_and_donate_flexible() {
    let (env, client, _owner, alice, bob, token) = setup();

    let id = client.create_campaign(&alice, &token, &1000i128, &3600u64, &FLEXIBLE);
    assert_eq!(id, 0);
    assert_eq!(client.campaign_count(), 1);

    client.donate(&bob, &0u32, &500i128);
    let campaign = client.get_campaign(&0u32);
    assert_eq!(campaign.total_raised, 500);
    assert_eq!(client.get_donation(&0u32, &bob), 500);

    // Bob's balance reduced
    let token_client = TokenClient::new(&env, &token);
    assert_eq!(token_client.balance(&bob), 9500);
}

#[test]
fn test_withdraw_after_deadline_flexible() {
    let (env, client, owner, alice, bob, token) = setup();

    client.create_campaign(&alice, &token, &1000i128, &3600u64, &FLEXIBLE);
    client.donate(&bob, &0u32, &500i128);

    // Fast forward past deadline
    env.ledger().with_mut(|l| l.timestamp += 3601);

    client.withdraw(&0u32);

    let token_client = TokenClient::new(&env, &token);
    // 2% fee on 500 = 10
    assert_eq!(token_client.balance(&owner), 10);
    assert_eq!(token_client.balance(&alice), 490);

    let campaign = client.get_campaign(&0u32);
    assert!(campaign.withdrawn);
}

#[test]
fn test_refund_aon_failed() {
    let (env, client, _owner, alice, bob, token) = setup();

    client.create_campaign(&alice, &token, &10_000i128, &3600u64, &ALL_OR_NOTHING);
    client.donate(&bob, &0u32, &500i128);

    env.ledger().with_mut(|l| l.timestamp += 3601);

    client.claim_refund(&bob, &0u32);

    let token_client = TokenClient::new(&env, &token);
    assert_eq!(token_client.balance(&bob), 10_000);
    assert_eq!(client.get_donation(&0u32, &bob), 0);
}

#[test]
fn test_aon_withdraw_blocked_when_goal_not_met() {
    let (env, client, _owner, alice, bob, token) = setup();

    client.create_campaign(&alice, &token, &10_000i128, &3600u64, &ALL_OR_NOTHING);
    client.donate(&bob, &0u32, &500i128);
    env.ledger().with_mut(|l| l.timestamp += 3601);

    let result = client.try_withdraw(&0u32);
    assert!(result.is_err());
}

#[test]
fn test_donate_blocked_after_deadline() {
    let (env, client, _owner, alice, bob, token) = setup();

    client.create_campaign(&alice, &token, &1000i128, &3600u64, &FLEXIBLE);
    env.ledger().with_mut(|l| l.timestamp += 3601);

    let result = client.try_donate(&bob, &0u32, &100i128);
    assert!(result.is_err());
}
