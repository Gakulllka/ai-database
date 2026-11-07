# /template-remove — Удаление макета

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<ObjectName> <TemplateName>`.

Удаляет макет и убирает его регистрацию из корневого XML объекта.

## Usage

```
/template-remove <ObjectName> <TemplateName>
```

| Параметр     | Обязательный | По умолчанию | Описание                            |
|--------------|:------------:|--------------|-------------------------------------|
| ObjectName   | да           | —            | Имя объекта                         |
| TemplateName | да           | —            | Имя макета для удаления             |
| SrcDir       | нет          | `src`        | Каталог исходников                  |

## Команда

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/remove-template.ps1" -ObjectName "<ObjectName>" -TemplateName "<TemplateName>" [-SrcDir "<SrcDir>"]
```

## Что удаляется

```
<SrcDir>/<ObjectName>/Templates/<TemplateName>.xml     # Метаданные макета
<SrcDir>/<ObjectName>/Templates/<TemplateName>/         # Каталог макета (рекурсивно)
```

## Что модифицируется

- `<SrcDir>/<ObjectName>.xml` — убирается `<Template>` из `ChildObjects`
- Для ExternalReport/Report: если удалённый макет был указан в `MainDataCompositionSchema` — значение очищается
