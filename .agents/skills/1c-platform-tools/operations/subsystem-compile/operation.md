# /subsystem-compile — генерация подсистемы из JSON

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `"[-DefinitionFile <json> | -Value <json-string>] -OutputDir <ConfigDir> [-Parent <path>]"`.

Принимает JSON-определение подсистемы → генерирует XML + файловую структуру + регистрирует в родителе (Configuration.xml или родительская подсистема).

## Параметры и команда

| Параметр | Описание |
|----------|----------|
| `DefinitionFile` | Путь к JSON-файлу определения |
| `Value` | Инлайн JSON-строка (альтернатива DefinitionFile) |
| `OutputDir` | Корень выгрузки (где `Subsystems/`, `Configuration.xml`) |
| `Parent` | Путь к XML родительской подсистемы (для вложенных) |
| `NoValidate` | Пропустить авто-валидацию |

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/subsystem-compile.ps1" -Value '<json>' -OutputDir '<ConfigDir>'
```

## JSON-определение

```json
{
  "name": "МояПодсистема",
  "synonym": "Моя подсистема",
  "comment": "",
  "includeInCommandInterface": true,
  "useOneCommand": false,
  "explanation": "Описание раздела",
  "picture": "CommonPicture.МояКартинка",
  "content": ["Catalog.Товары", "Document.Заказ"]
}
```

Минимально: только `name`. Остальное — дефолты.

## Примеры

```powershell
# Минимальная подсистема
... -Value '{"name":"Тест"}' -OutputDir config/

# С составом и картинкой
... -Value '{"name":"Продажи","content":["Catalog.Товары","Report.Продажи"],"picture":"CommonPicture.Продажи"}' -OutputDir config/

# Вложенная подсистема
... -Value '{"name":"Дочерняя"}' -OutputDir config/ -Parent config/Subsystems/Продажи.xml
```
