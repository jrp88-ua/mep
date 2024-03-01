use crate::models::EntityId;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateParams<D> {
    pub data: D,
}

#[derive(Deserialize)]
pub struct UpdateParams<D> {
    pub id: EntityId,
    pub data: D,
}

#[derive(Deserialize)]
pub struct GetParams {
    pub id: EntityId,
}

#[derive(Deserialize)]
pub struct DeleteParams {
    pub id: EntityId,
}
