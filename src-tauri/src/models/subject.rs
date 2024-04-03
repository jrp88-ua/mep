use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

use crate::ctx::ApplicationState;

use super::{EntityId, RepositoryEntity, RepositoryEntityUpdater, WithAssignedId};

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

impl Into<SubjectForUpdate> for &Subject {
    fn into(self) -> SubjectForUpdate {
        SubjectForUpdate {
            name: Some(self.name.clone()),
            kind: Some(self.kind.clone()),
        }
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

impl Into<SubjectForUpdate> for SubjectForCreate {
    fn into(self) -> SubjectForUpdate {
        SubjectForUpdate {
            name: Some(self.name),
            kind: Some(self.kind),
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

impl RepositoryEntityUpdater<Subject> for SubjectForUpdate {
    fn update_values(self, entity: &mut Subject) {
        if let Some(name) = self.name {
            entity.name = name;
        }
        if let Some(kind) = self.kind {
            entity.kind = kind;
        }
    }
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

    pub fn bulk_create_or_update_subjects(
        &mut self,
        subjects: impl Iterator<Item = SubjectForCreate>,
    ) -> Box<dyn FnOnce(&ApplicationState) -> ()> {
        enum Undo {
            Created { id: EntityId },
            Updated { id: EntityId, old_values: Subject },
        }
        let mut operations: Vec<Undo> = Vec::new();
        let start_id = self.get_subjects().current_id.clone();

        for values in subjects {
            if let Some(s) = self
                .get_subjects()
                .any_match(&|subject| subject.name == values.name)
            {
                let old_values = s.clone();
                let update_values: SubjectForUpdate = values.into();
                if self
                    .get_subjects()
                    .update(s.id.clone(), update_values)
                    .is_some()
                {
                    operations.push(Undo::Updated {
                        id: s.id.clone(),
                        old_values,
                    })
                }
            } else {
            }
        }

        Box::new(move |state: &ApplicationState| {
            state.get_subjects().current_id = start_id;
            operations.iter().for_each(|undo| match undo {
                Undo::Created { id } => {
                    state.get_subjects().delete(id.clone());
                }
                Undo::Updated { id, old_values } => {
                    let old_values: SubjectForUpdate = old_values.into();
                    state.get_subjects().update(id.clone(), old_values);
                }
            });
        })
    }
}

// endregion: --- subject service
