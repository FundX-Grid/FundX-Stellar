#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct FundXContract;

#[contractimpl]
impl FundXContract {
    pub fn hello(env: Env, to: Symbol) -> soroban_sdk::Vec<Symbol> {
        soroban_sdk::vec![&env, soroban_sdk::symbol_short!("Hello"), to]
    }
}
