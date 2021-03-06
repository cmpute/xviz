# @generated by generate_proto_mypy_stubs.py.  Do not edit!
import sys
from google.protobuf.descriptor import (
    Descriptor as google___protobuf___descriptor___Descriptor,
    EnumDescriptor as google___protobuf___descriptor___EnumDescriptor,
    FileDescriptor as google___protobuf___descriptor___FileDescriptor,
)

from google.protobuf.internal.containers import (
    RepeatedCompositeFieldContainer as google___protobuf___internal___containers___RepeatedCompositeFieldContainer,
    RepeatedScalarFieldContainer as google___protobuf___internal___containers___RepeatedScalarFieldContainer,
)

from google.protobuf.internal.enum_type_wrapper import (
    _EnumTypeWrapper as google___protobuf___internal___enum_type_wrapper____EnumTypeWrapper,
)

from google.protobuf.message import (
    Message as google___protobuf___message___Message,
)

from typing import (
    Iterable as typing___Iterable,
    NewType as typing___NewType,
    Optional as typing___Optional,
    Text as typing___Text,
    cast as typing___cast,
)

from typing_extensions import (
    Literal as typing_extensions___Literal,
)


builtin___bool = bool
builtin___bytes = bytes
builtin___float = float
builtin___int = int


DESCRIPTOR: google___protobuf___descriptor___FileDescriptor = ...

class TreeTable(google___protobuf___message___Message):
    DESCRIPTOR: google___protobuf___descriptor___Descriptor = ...

    @property
    def columns(self) -> google___protobuf___internal___containers___RepeatedCompositeFieldContainer[type___TreeTableColumn]: ...

    @property
    def nodes(self) -> google___protobuf___internal___containers___RepeatedCompositeFieldContainer[type___TreeTableNode]: ...

    def __init__(self,
        *,
        columns : typing___Optional[typing___Iterable[type___TreeTableColumn]] = None,
        nodes : typing___Optional[typing___Iterable[type___TreeTableNode]] = None,
        ) -> None: ...
    def ClearField(self, field_name: typing_extensions___Literal[u"columns",b"columns",u"nodes",b"nodes"]) -> None: ...
type___TreeTable = TreeTable

class TreeTableColumn(google___protobuf___message___Message):
    DESCRIPTOR: google___protobuf___descriptor___Descriptor = ...
    ColumnTypeValue = typing___NewType('ColumnTypeValue', builtin___int)
    type___ColumnTypeValue = ColumnTypeValue
    ColumnType: _ColumnType
    class _ColumnType(google___protobuf___internal___enum_type_wrapper____EnumTypeWrapper[TreeTableColumn.ColumnTypeValue]):
        DESCRIPTOR: google___protobuf___descriptor___EnumDescriptor = ...
        TREE_TABLE_COLUMN_COLUMN_TYPE_INVALID = typing___cast(TreeTableColumn.ColumnTypeValue, 0)
        INT32 = typing___cast(TreeTableColumn.ColumnTypeValue, 1)
        DOUBLE = typing___cast(TreeTableColumn.ColumnTypeValue, 2)
        STRING = typing___cast(TreeTableColumn.ColumnTypeValue, 3)
        BOOLEAN = typing___cast(TreeTableColumn.ColumnTypeValue, 4)
    TREE_TABLE_COLUMN_COLUMN_TYPE_INVALID = typing___cast(TreeTableColumn.ColumnTypeValue, 0)
    INT32 = typing___cast(TreeTableColumn.ColumnTypeValue, 1)
    DOUBLE = typing___cast(TreeTableColumn.ColumnTypeValue, 2)
    STRING = typing___cast(TreeTableColumn.ColumnTypeValue, 3)
    BOOLEAN = typing___cast(TreeTableColumn.ColumnTypeValue, 4)
    type___ColumnType = ColumnType

    display_text: typing___Text = ...
    type: type___TreeTableColumn.ColumnTypeValue = ...
    unit: typing___Text = ...

    def __init__(self,
        *,
        display_text : typing___Optional[typing___Text] = None,
        type : typing___Optional[type___TreeTableColumn.ColumnTypeValue] = None,
        unit : typing___Optional[typing___Text] = None,
        ) -> None: ...
    def ClearField(self, field_name: typing_extensions___Literal[u"display_text",b"display_text",u"type",b"type",u"unit",b"unit"]) -> None: ...
type___TreeTableColumn = TreeTableColumn

class TreeTableNode(google___protobuf___message___Message):
    DESCRIPTOR: google___protobuf___descriptor___Descriptor = ...
    id: builtin___int = ...
    parent: builtin___int = ...
    column_values: google___protobuf___internal___containers___RepeatedScalarFieldContainer[typing___Text] = ...

    def __init__(self,
        *,
        id : typing___Optional[builtin___int] = None,
        parent : typing___Optional[builtin___int] = None,
        column_values : typing___Optional[typing___Iterable[typing___Text]] = None,
        ) -> None: ...
    def ClearField(self, field_name: typing_extensions___Literal[u"column_values",b"column_values",u"id",b"id",u"parent",b"parent"]) -> None: ...
type___TreeTableNode = TreeTableNode
