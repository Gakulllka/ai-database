# /subsystem-edit — редактирование подсистемы 1С

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `-SubsystemPath <path> -Operation <op> -Value <value>`.

Точечное редактирование XML подсистемы: состав, дочерние подсистемы, свойства.

## Параметры и команда

| Параметр | Описание |
|----------|----------|
| `SubsystemPath` | Путь к XML-файлу подсистемы |
| `DefinitionFile` | JSON-файл с массивом операций |
| `Operation` | Одна операция (альтернатива DefinitionFile) |
| `Value` | Значение для операции |
| `NoValidate` | Пропустить авто-валидацию |

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/subsystem-edit.ps1" -SubsystemPath '<path>' -Operation add-content -Value 'Catalog.Товары'
```

## Операции

| Операция | Значение | Описание |
|----------|----------|----------|
| `add-content` | `"Catalog.X"` или `["Catalog.X","Document.Y"]` | Добавить объекты в Content |
| `remove-content` | `"Catalog.X"` или `["Catalog.X"]` | Удалить объекты из Content |
| `add-child` | `"ИмяПодсистемы"` | Добавить дочернюю подсистему в ChildObjects |
| `remove-child` | `"ИмяПодсистемы"` | Удалить дочернюю подсистему |
| `set-property` | `{"name":"prop","value":"val"}` | Изменить свойство (Synonym, IncludeInCommandInterface, UseOneCommand, etc.) |

## Примеры

```powershell
# Добавить объект в состав
... -SubsystemPath Subsystems/Продажи.xml -Operation add-content -Value "Document.Заказ"

# Добавить несколько объектов
... -SubsystemPath Subsystems/Продажи.xml -Operation add-content -Value '["Catalog.Товары","Report.Продажи"]'

# Удалить объект из состава
... -SubsystemPath Subsystems/Продажи.xml -Operation remove-content -Value "Report.Старый"

# Добавить дочернюю подсистему
... -SubsystemPath Subsystems/Продажи.xml -Operation add-child -Value "НоваяДочерняя"

# Изменить свойство
... -SubsystemPath Subsystems/Продажи.xml -Operation set-property -Value '{"name":"IncludeInCommandInterface","value":"false"}'
```
