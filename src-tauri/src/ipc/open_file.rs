use tauri::command;

#[command]
pub async fn open_file(file: String, password: String) -> Result<(), ()> {
    println!("{file}->{password}");
    Err(())
}
