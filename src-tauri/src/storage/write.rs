use aead::{consts::U7, generic_array::GenericArray};
use aead_io::{ArrayBuffer, EncryptBE32BufWriter};
use aes_gcm_siv::Aes256GcmSiv;
use flate2::{write::ZlibEncoder, Compression};
use rand::Rng;
use serde::Serialize;
use std::{fs::OpenOptions, io::Write};
use ts_rs::TS;

use crate::models::AppValues;

use super::{create_password_check, derive_key, SaltAndNonce, FILE_HEADER, PASSWORD_CHECK_LENGTH};

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum SaveToFileWriteError {
    Header,
    Version,
    Salt,
    Nonce,
    Password,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum SaveToFileOpenFileError {
    Permissions,
    Other,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum SaveToFileError {
    Writing { part: SaveToFileWriteError },
    KeyDerivation,
    CreateCipher,
    OpenFile { case: SaveToFileOpenFileError },
    Serialization,
    PasswordCheck,
}

pub fn save_to_file(
    values: AppValues,
    file: String,
    password: String,
) -> Result<(), SaveToFileError> {
    let data_salt_and_nonce = SaltAndNonce::random();
    let password_check_salt_and_nonce = SaltAndNonce::random();
    let key = derive_key(&password, &data_salt_and_nonce.salt)
        .map_err(|_| SaveToFileError::KeyDerivation)?;

    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .create(true)
        .open(file)
        .map_err(|err| SaveToFileError::OpenFile {
            case: match err.kind() {
                std::io::ErrorKind::PermissionDenied => SaveToFileOpenFileError::Permissions,
                _ => SaveToFileOpenFileError::Other,
            },
        })?;

    write_header_and_version(&mut file)?;
    write_salt_and_nonce(&mut file, &data_salt_and_nonce)?;

    write_password_check(&mut file, &password)?;

    let encryptor = EncryptBE32BufWriter::<Aes256GcmSiv, _, _>::new(
        &key,
        &GenericArray::<u8, U7>::clone_from_slice(&data_salt_and_nonce.nonce[5..]),
        ArrayBuffer::<128>::new(),
        file,
    )
    .map_err(|_| SaveToFileError::CreateCipher)?;

    let compressor = ZlibEncoder::new(encryptor, Compression::best());

    serde_json::to_writer(compressor, &values).map_err(|_| SaveToFileError::Serialization)?;

    Ok(())
}

fn write_password_check(writer: &mut impl Write, password: &String) -> Result<(), SaveToFileError> {
    let mut salt = [0u8; PASSWORD_CHECK_LENGTH as usize];
    rand::thread_rng().fill(&mut salt);

    let check =
        create_password_check(password, &salt).map_err(|_| SaveToFileError::PasswordCheck)?;

    writer
        .write_all(&salt)
        .map_err(|_| SaveToFileError::PasswordCheck)?;
    writer
        .write_all(&check)
        .map_err(|_| SaveToFileError::PasswordCheck)?;
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
