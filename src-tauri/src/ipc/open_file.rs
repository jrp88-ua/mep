use std::env;

use log::info;
use tauri::command;

use crate::{
    models::AppValues,
    storage::read::{load_from_file, ReadFromFileError},
};

#[command]
pub async fn open_file_from_open_with() -> Result<Vec<String>, ()> {
    Ok(env::args().collect())
}

#[command]
pub fn open_file(file: String, password: String) -> Result<AppValues, ReadFromFileError> {
    info!("Opening file {file} with password {password}");
    load_from_file(file, password)
}
