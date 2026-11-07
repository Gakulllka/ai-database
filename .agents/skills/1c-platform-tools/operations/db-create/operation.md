# /db-create — Создание информационной базы

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<path|name>`.

Создаёт новую информационную базу 1С (файловую или серверную) и предлагает зарегистрировать в `.v8-project.json`.

## Usage

```
/db-create <path>                   — файловая база по указанному пути
/db-create <server>/<name>          — серверная база
/db-create                          — интерактивно
```

## Параметры подключения

Прочитай `.v8-project.json` из корня проекта. Платформа — `v8path` записи создаваемой базы,
если она уже в реестре, иначе корневой `v8path`. Не задан ни там, ни там — `-V8Path` не передавай.
После создания базы предложи зарегистрировать через `/db-list add`.

## Команда

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/db-create.ps1" <параметры>
```

### Параметры скрипта

| Параметр | Обязательный | Описание |
|----------|:------------:|----------|
| `-V8Path <путь>` | нет | Каталог bin платформы, или полный путь к `1cv8.exe` / `ibcmd.exe` |
| `-InfoBasePath <путь>` | * | Путь к файловой базе |
| `-InfoBaseServer <сервер>` | * | Сервер 1С (для серверной базы) |
| `-InfoBaseRef <имя>` | * | Имя базы на сервере |
| `-UseTemplate <файл>` | нет | Создать из шаблона (.cf или .dt) |
| `-AddToList` | нет | Добавить в список баз 1С |
| `-ListName <имя>` | нет | Имя базы в списке |
| `-AdditionalV8Arguments <список>` | нет | Доп. аргументы запуска `1cv8.exe` через запятую, напр. `/UseHwLicenses+` |
| `-AdditionalIbcmdArguments <список>` | нет | Доп. аргументы `ibcmd` через запятую, в форме `--ключ=значение` |

> `*` — нужен либо `-InfoBasePath`, либо пара `-InfoBaseServer` + `-InfoBaseRef`

## После создания

Предложи зарегистрировать базу в `.v8-project.json` (через `/db-list add`)
3. Если указан шаблон `/UseTemplate` — предупреди что конфигурация будет загружена из шаблона

## Примеры

```powershell
# Создать файловую базу
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/db-create.ps1" -InfoBasePath "C:\Bases\NewDB"

# Создать серверную базу
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/db-create.ps1" -InfoBaseServer "srv01" -InfoBaseRef "MyApp_Test"

# Создать из шаблона CF
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/db-create.ps1" -InfoBasePath "C:\Bases\NewDB" -UseTemplate "C:\Templates\config.cf"

# Создать и добавить в список баз
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/db-create.ps1" -InfoBasePath "C:\Bases\NewDB" -AddToList -ListName "Новая база"
```
