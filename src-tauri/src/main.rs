// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ctx;
mod event;
mod ipc;
mod models;

use log::LevelFilter;
use tauri_plugin_log::LogTarget;

#[cfg(debug_assertions)]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::Webview];

#[cfg(not(debug_assertions))]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::LogDir];

#[tokio::main]
async fn main() -> Result<(), ()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets(LOG_TARGETS)
                .with_colors(tauri_plugin_log::fern::colors::ColoredLevelConfig::default())
                .level_for("tauri", log::LevelFilter::Info)
                .level(LevelFilter::Debug)
                .build(),
        )
        //.manage(storage::database::DatabaseState::default())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
