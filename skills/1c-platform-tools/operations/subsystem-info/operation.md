# /subsystem-info — Структура подсистемы 1С

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<SubsystemPath> [-Mode overview|content|ci|tree|full] [-Name <элемент>]`.

Читает XML подсистемы из выгрузки конфигурации 1С и выводит компактное описание структуры.

## Параметры и команда

| Параметр | Описание |
|----------|----------|
| `SubsystemPath` | Путь к XML-файлу подсистемы, каталогу подсистемы или каталогу `Subsystems/` (для tree) |
| `Mode` | Режим: `overview` (default), `content`, `ci`, `tree`, `full` |
| `Name` | Drill-down: тип объекта в content, секция в ci, имя подсистемы в tree |
| `Limit` / `Offset` | Пагинация (по умолчанию 150 строк) |
| `OutFile` | Записать результат в файл (UTF-8 BOM) |

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/subsystem-info.ps1" -SubsystemPath "<путь>"
```

## Пять режимов

| Режим | Что показывает |
|---|---|
| `overview` *(default)* | Компактная сводка: свойства, состав (сгруппирован по типам), дочерние подсистемы, наличие CI |
| `content` | Список Content с группировкой по типу объекта. `-Name Catalog` — только каталоги |
| `ci` | Разбор CommandInterface.xml: видимость, размещение, порядок команд/подсистем/групп |
| `tree` | Рекурсивное дерево иерархии подсистем с маркерами [CI], [OneCmd], [Скрыт] |
| `full` | Полная сводка: overview + content + ci в одном вызове |

## Примеры

```powershell
# Обзор подсистемы
... -SubsystemPath Subsystems/Продажи.xml

# Состав подсистемы
... -SubsystemPath Subsystems/Администрирование.xml -Mode content

# Только документы в составе
... -SubsystemPath Subsystems/Продажи.xml -Mode content -Name Document

# Командный интерфейс подсистемы
... -SubsystemPath Subsystems/Продажи.xml -Mode ci

# Дерево подсистем от корня
... -SubsystemPath Subsystems -Mode tree

# Дерево от конкретной подсистемы
... -SubsystemPath Subsystems/Администрирование.xml -Mode tree

# Дерево только для одной подсистемы
... -SubsystemPath Subsystems -Mode tree -Name Администрирование
```
