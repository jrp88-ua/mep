use log::info;
use tauri::command;

use crate::{
    models::AppValues,
    storage::write::{save_to_file, SaveToFileError},
};

#[command]
pub fn save_file(values: AppValues, file: String, password: String) -> Result<(), SaveToFileError> {
    info!("Saving to file {file} with password {password}");
    save_to_file(values, file, password)
}
