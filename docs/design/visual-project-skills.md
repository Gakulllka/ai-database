# Пакет «Визуал»

Пакет объединяет 19 навыков из снимка `visual-project-skills-2026-11-18.zip`.
В рабочей копии Database они доступны в `skills/` и в проекциях Codex
`.agents/skills/`. Для выборочной установки сначала проверь план:

```powershell
node scripts/install-apply.js --target codex --modules visual-project-skills --dry-run
```

Убери `--dry-run`, чтобы выполнить выбранную установку. К существующему профилю
пакет можно добавить через `--with capability:visual-project-skills`.

## Навыки

- Стили · [Кислотный пластилин](../../skills/acid-clay/SKILL.md),
  [Взрослый комикс](../../skills/adult-comic/SKILL.md),
  [Ботаническая механика](../../skills/botanical-mechanics/SKILL.md),
  [Грязный хоррор](../../skills/dirty-horror/SKILL.md),
  [Сказочное фэнтези](../../skills/fairytale-fantasy/SKILL.md),
  [Инди-гротеск](../../skills/indie-grotesque/SKILL.md),
  [Ink Punk](../../skills/ink-punk/SKILL.md),
  [Бумажный театр снов](../../skills/paper-dream-theatre/SKILL.md),
  [Поп-анимация](../../skills/pop-animation/SKILL.md) и
  [Ретро-3D](../../skills/retro-3d-painted/SKILL.md).
- Персонажи · [Даша](../../skills/dasha-character/SKILL.md) и
  [Лиза](../../skills/lisa-character/SKILL.md).
- Процессы · [Выбор процесса](../../skills/visual-design-base/SKILL.md),
  [игровой арт](../../skills/game-art-production/SKILL.md),
  [арт для новелл](../../skills/visual-novel-art/SKILL.md),
  [смена текстур](../../skills/model-texture-restyle/SKILL.md),
  [развитие стиля](../../skills/visual-style-development/SKILL.md),
  [практика](../../skills/visual-design-practice/SKILL.md) и
  [оценка качества](../../skills/visual-quality-review/SKILL.md).

Применяй художественные правила к выбранному пользователем направлению.
Сказочное фэнтези и смена текстур сохраняют экспериментальный статус. Ретро-3D
хранит разбор неудачных попыток. В профиле Даши принят образ C для продолжения
работы, а редизайн ещё не завершён.

Рабочая история и полные галереи хранятся в исходном архиве проекта.
В пакет входят рабочие инструкции, собственные изображения с указанными ролями,
отобранные примеры, шаблоны и растровый анализатор. Пути к изображениям в
манифестах отсчитываются от корня Database или корня обычной установки.
Для компактных сборок, Copilot и Antigravity справочные материалы доступны
в [каталоге Database](https://github.com/Gakulllka/ai-database/tree/database/assets/visual-project-skills).
Полный набор ресурсов занимает около 256 МиБ.

Фотографии из исходного набора поз, пользовательский скриншот и материалы
реконструкций со сторонними изображениями доступны в исходном архиве.
Заметки о них сохранены в навыках.
