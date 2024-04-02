use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

use crate::ctx::ApplicationState;

use super::{EntityId, RepositoryEntity, WithAssignedId};

// region: --- subject

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
// kind instead of type because type is a reserved keyword
pub enum SubjectKind {
    OBLIGATORY,
    VOLUNTARY,
    UNKNOWN,
}

impl From<&str> for SubjectKind {
    fn from(value: &str) -> Self {
        match value {
            "OBLIGATORY" => Self::OBLIGATORY,
            "VOLUNTARY" => Self::VOLUNTARY,
            _ => Self::UNKNOWN,
        }
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Subject {
    pub id: EntityId,
    pub name: String,
    pub kind: SubjectKind,
}

impl RepositoryEntity for Subject {
    fn id(&self) -> EntityId {
        self.id.clone()
    }
}

// endregion: --- subject

// region: --- subject for create

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubjectForCreate {
    pub name: String,
    pub kind: SubjectKind,
}

impl WithAssignedId<Subject> for SubjectForCreate {
    fn with_assigned_id(self, id: &EntityId) -> Subject {
        Subject {
            id: id.clone(),
            name: self.name,
            kind: self.kind,
        }
    }
}

// endregion: --- subject for create

// region: --- subject for update

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubjectForUpdate {
    pub name: Option<String>,
    pub kind: Option<SubjectKind>,
}

// endregion: --- subject for update

// region: --- subject service

impl ApplicationState {
    pub fn get_all_subjects(&self) -> Vec<Subject> {
        self.get_subjects()
            .get_all()
            .iter()
            .map(|subject| Subject::clone(&subject))
            .collect()
    }

    pub fn get_or_create_subject(&mut self, values: SubjectForCreate) -> Subject {
        let mut subjects = self.get_subjects();
        let all = subjects.get_all();
        let subject = all.iter().find(|sub| sub.name == values.name);
        match subject {
            Some(subject) => Subject::clone(subject),
            None => {
                let result = subjects.create(values);
                self.modified_state();
                result.clone()
            }
        }
    }
}

// endregion: --- subject service
