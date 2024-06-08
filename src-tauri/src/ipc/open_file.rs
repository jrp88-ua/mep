use std::env;

use tauri::command;

#[command]
pub async fn open_file_from_open_with() -> Result<Vec<String>, ()> {
    Ok(env::args().collect())
}

#[command]
pub async fn open_file(file: String, password: String) -> Result<(), ()> {
    println!("{file}->{password}");
    Err(())
}
