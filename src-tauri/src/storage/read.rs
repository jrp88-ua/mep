use std::{fs::OpenOptions, io::Read};

use aead_io::{ArrayBuffer, DecryptBE32BufReader};
use aes_gcm_siv::Aes256GcmSiv;
use flate2::read::ZlibDecoder;
use serde::Serialize;
use ts_rs::TS;

use crate::models::AppValues;

use super::{create_password_check, derive_key, SaltAndNonce, FILE_HEADER, PASSWORD_CHECK_LENGTH};

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ReadFromFileReadError {
    Header,
    Version,
    Salt,
    Nonce,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ReadFromFileInvalidError {
    Header,
    Version,
    Password,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ReadFromFileOpenFileError {
    NotFound,
    Permissions,
    Other,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ReadFromFileError {
    Reading { part: ReadFromFileReadError },
    Invalid { part: ReadFromFileInvalidError },
    KeyDerivation,
    CreateCipher,
    OpenFile { case: ReadFromFileOpenFileError },
    Serialization,
    PasswordCheck,
}

pub fn load_from_file(file: String, password: String) -> Result<AppValues, ReadFromFileError> {
    let mut file =
        OpenOptions::new()
            .read(true)
            .open(file)
            .map_err(|err| ReadFromFileError::OpenFile {
                case: match err.kind() {
                    std::io::ErrorKind::NotFound => ReadFromFileOpenFileError::NotFound,
                    std::io::ErrorKind::PermissionDenied => ReadFromFileOpenFileError::Permissions,
                    _ => ReadFromFileOpenFileError::Other,
                },
            })?;

    verify_header_and_version(&mut file)?;
    let data_salt_and_nonce = extract_salt_and_nonce(&mut file)?;

    verify_password(&mut file, &password)?;

    let data_key = derive_key(&password, &data_salt_and_nonce.salt)
        .map_err(|_| ReadFromFileError::KeyDerivation)?;

    let decriptor =
        DecryptBE32BufReader::<Aes256GcmSiv, _, _>::new(&data_key, ArrayBuffer::<128>::new(), file)
            .map_err(|_| ReadFromFileError::CreateCipher)?;

    let decompressor = ZlibDecoder::new(decriptor);

    let values =
        serde_json::from_reader(decompressor).map_err(|_| ReadFromFileError::Serialization)?;

    Ok(values)
}

fn verify_password(reader: &mut impl Read, password: &String) -> Result<(), ReadFromFileError> {
    let mut salt = [0u8; PASSWORD_CHECK_LENGTH as usize];
    let mut readed = [0u8; PASSWORD_CHECK_LENGTH as usize];

    reader
        .read_exact(&mut salt)
        .map_err(|_| ReadFromFileError::PasswordCheck)?;
    reader
        .read_exact(&mut readed)
        .map_err(|_| ReadFromFileError::PasswordCheck)?;

    let expected =
        create_password_check(password, &salt).map_err(|_| ReadFromFileError::PasswordCheck)?;

    if expected != readed.to_vec() {
        return Err(ReadFromFileError::Invalid {
            part: ReadFromFileInvalidError::Password,
        });
    }

    Ok(())
}

fn verify_header_and_version(reader: &mut impl Read) -> Result<(), ReadFromFileError> {
    let mut header: [u8; 4] = [0; 4];
    reader
        .read_exact(&mut header)
        .map_err(|_| ReadFromFileError::Reading {
            part: ReadFromFileReadError::Header,
        })?;
    if &header != FILE_HEADER {
        return Err(ReadFromFileError::Invalid {
            part: ReadFromFileInvalidError::Header,
        })?;
    }

    let mut version: [u8; 1] = [1; 1];
    reader
        .read_exact(&mut version)
        .map_err(|_| ReadFromFileError::Reading {
            part: ReadFromFileReadError::Version,
        })?;
    if version[0] != 1 {
        return Err(ReadFromFileError::Invalid {
            part: ReadFromFileInvalidError::Version,
        })?;
    }

    Ok(())
}

fn extract_salt_and_nonce(reader: &mut impl Read) -> Result<SaltAndNonce, ReadFromFileError> {
    let mut salt_and_nonce = SaltAndNonce::default();

    reader
        .read_exact(&mut salt_and_nonce.salt)
        .map_err(|_| ReadFromFileError::Reading {
            part: ReadFromFileReadError::Salt,
        })?;

    reader
        .read_exact(&mut salt_and_nonce.nonce)
        .map_err(|_| ReadFromFileError::Reading {
            part: ReadFromFileReadError::Nonce,
        })?;

    Ok(salt_and_nonce)
}
