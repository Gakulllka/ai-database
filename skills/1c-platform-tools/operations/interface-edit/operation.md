# /interface-edit — редактирование CommandInterface.xml

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<CIPath> <Operation> <Value>`.

Точечное редактирование файла командного интерфейса подсистемы 1С.

## Параметры

| Параметр | Обяз. | Описание |
|----------|:-----:|----------|
| CIPath | да | Путь к CommandInterface.xml |
| Operation | нет | Операция: hide, show, place, order, subsystem-order, group-order |
| Value | нет | Значение для операции |
| DefinitionFile | нет | JSON-файл с массивом операций (альтернатива Operation) |
| CreateIfMissing | нет | Создать файл если не существует |
| NoValidate | нет | Пропустить авто-валидацию |

## Команда

### Inline mode

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/interface-edit.ps1" -CIPath '<path>' -Operation hide -Value '<cmd>'
```

### JSON mode

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/interface-edit.ps1" -CIPath '<path>' -DefinitionFile '<json>'
```

## Операции

| Операция | Значение | Описание |
|----------|----------|----------|
| hide | Cmd.Name или массив | Скрыть команду (CommandsVisibility, false) |
| show | Cmd.Name или массив | Показать команду (visibility, true) |
| place | {"command":"...","group":"CommandGroup.X"} | Разместить команду в группе |
| order | {"group":"...","commands":[...]} | Задать порядок команд в группе |
| subsystem-order | ["Subsystem.X.Subsystem.A",...] | Порядок дочерних подсистем |
| group-order | ["NavigationPanelOrdinary",...] | Порядок групп |

## Примеры

```powershell
# Скрыть команду
... -CIPath Subsystems/Продажи/Ext/CommandInterface.xml -Operation hide -Value "Catalog.Товары.StandardCommand.OpenList"

# Показать команду
... -Operation show -Value "Report.Продажи.Command.Отчёт"

# Разместить в группе
... -Operation place -Value '{"command":"Report.X.Command.Y","group":"CommandGroup.Отчеты"}'

# Задать порядок подсистем
... -Operation subsystem-order -Value '["Subsystem.X.Subsystem.A","Subsystem.X.Subsystem.B"]'

# Создать новый CI
... -CIPath <new-path> -Operation subsystem-order -Value '[...]' -CreateIfMissing
```

## Верификация

```
/interface-validate <CIPath>
```
