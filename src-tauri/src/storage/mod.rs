use aead::{consts::U32, generic_array::GenericArray};
use argon2::{Config, Error};
use rand::Rng;

pub mod read;
pub mod write;

pub const FILE_HEADER: &[u8; 4] = b"MEPv";

#[derive(Default)]
pub struct SaltAndNonce {
    nonce: [u8; 12],
    salt: [u8; 16],
}

impl SaltAndNonce {
    fn random() -> Self {
        let mut salt = [0u8; 16];
        let mut nonce = [0u8; 12];
        rand::thread_rng().fill(&mut salt);
        rand::thread_rng().fill(&mut nonce);
        SaltAndNonce { salt, nonce }
    }
}

pub fn derive_key(password: &String, salt: &[u8]) -> Result<GenericArray<u8, U32>, Error> {
    argon2::hash_raw(
        password.as_bytes(),
        salt,
        &Config {
            variant: argon2::Variant::Argon2id,
            version: argon2::Version::Version13,
            mem_cost: 250000,
            hash_length: 32,
            time_cost: 1,
            lanes: 1,
            secret: &[],
            ad: &[],
        },
    )
    .map(|key| GenericArray::clone_from_slice(key.as_slice()))
    /*Hasher::new()
    .algorithm(argon2_kdf::Algorithm::Argon2id)
    .salt_length(24)
    .hash_length(42)
    .iterations(12)
    .memory_cost_kib(250000)
    .threads(1)
    .hash(password.as_bytes())*/
}
