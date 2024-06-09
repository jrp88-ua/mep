use aead::{consts::U7, generic_array::GenericArray};
use aead_io::{ArrayBuffer, EncryptBE32BufWriter};
use aes_gcm_siv::Aes256GcmSiv;
use flate2::{write::ZlibEncoder, Compression};
use serde::Serialize;
use std::{fs::OpenOptions, io::Write};
use ts_rs::TS;

use crate::models::AppValues;

use super::{derive_key, SaltAndNonce, FILE_HEADER};

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum SaveToFileWriteError {
    Header,
    Version,
    Salt,
    Nonce,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum SaveToFileError {
    Writing { part: SaveToFileWriteError },
    KeyDerivation,
    CreateCipher,
    OpenFile,
    Serialization,
}

pub fn save_to_file(
    values: AppValues,
    file: String,
    password: String,
) -> Result<(), SaveToFileError> {
    let salt_and_nonce = SaltAndNonce::random();
    let key =
        derive_key(&password, &salt_and_nonce.salt).map_err(|_| SaveToFileError::KeyDerivation)?;

    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .create(true)
        .open(file)
        .map_err(|_| SaveToFileError::OpenFile)?;

    write_header_and_version(&mut file)?;

    let mut compressor = ZlibEncoder::new(file, Compression::best());

    write_salt_and_nonce(&mut compressor, &salt_and_nonce)?;

    let encryptor = EncryptBE32BufWriter::<Aes256GcmSiv, _, _>::new(
        &key,
        &GenericArray::<u8, U7>::clone_from_slice(&salt_and_nonce.nonce[5..]),
        ArrayBuffer::<128>::new(),
        compressor,
    )
    .map_err(|_| SaveToFileError::CreateCipher)?;

    serde_json::to_writer(encryptor, &values).map_err(|_| SaveToFileError::Serialization)?;

    Ok(())
}

fn write_header_and_version(writer: &mut impl Write) -> Result<(), SaveToFileError> {
    writer
        .write_all(FILE_HEADER)
        .map_err(|_| SaveToFileError::Writing {
            part: SaveToFileWriteError::Header,
        })?;
    writer
        .write_all(&[1][..])
        .map_err(|_| SaveToFileError::Writing {
            part: SaveToFileWriteError::Version,
        })?;
    Ok(())
}

fn write_salt_and_nonce(
    writer: &mut impl Write,
    salt_and_nonce: &SaltAndNonce,
) -> Result<(), SaveToFileError> {
    writer
        .write_all(&salt_and_nonce.salt)
        .map_err(|_| SaveToFileError::Writing {
            part: SaveToFileWriteError::Salt,
        })?;

    writer
        .write_all(&salt_and_nonce.nonce)
        .map_err(|_| SaveToFileError::Writing {
            part: SaveToFileWriteError::Nonce,
        })?;
    Ok(())
}
