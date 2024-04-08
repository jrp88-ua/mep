use serde::{Deserialize, Serialize};

pub mod academic_centre;
pub mod examinee;
pub mod subject;

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone, Hash)]
pub struct EntityId(i32);
