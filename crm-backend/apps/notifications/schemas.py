from datetime import date, datetime
from enum import Enum
from typing import Type

from pydantic import BaseModel


class Flag(str, Enum):
    RED = 'red'
    ORANGE = 'orange'
    YELLOW = 'yellow'
    GREEN = 'green'


class ServiceEndingMetadata(BaseModel):
    schema_version: int = 1
    service_id: int
    service_acesso: str
    customer_id: int
    customer_name: str
    service_data_fim: date
    flag: Flag
    generated_at: datetime


SCHEMA_REGISTRY: dict[tuple[str, str], Type[BaseModel]] = {
    ('SERVICO', 'SERVICO_A_TERMINAR'): ServiceEndingMetadata,
}


def validate_metadata(type_: str, subtype: str, raw: dict) -> BaseModel:
    schema = SCHEMA_REGISTRY.get((type_, subtype))
    if schema is None:
        raise ValueError(f'no metadata schema registered for ({type_},{subtype})')
    return schema.model_validate(raw)
