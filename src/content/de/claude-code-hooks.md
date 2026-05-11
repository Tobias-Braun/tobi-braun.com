---
title: "Claude Code Hooks – Sicherheit durch Invarianten"
description: "Wie Claude Code Hooks kritische Invarianten in autonomen KI-Entwicklungsworkflows durchsetzen: Secrets-Scanner, Co-Autoren-Filter und das Fail-Closed-Prinzip für sichereres Vibe Coding."
category: Technical
date: 2025-09-01
readTime: "11 min"
image: "/articles/claude-code-hooks/claude-code-thumb.png"
lang: de
translationSlug: claude-code-hooks
---

## 1 Einleitung

Immer mehr Entwickler:innen setzen Claude Code ein, um Code zu schreiben – nicht nur für Prototypen oder Experimente, sondern direkt im Arbeitsalltag für echte Systeme. Das spart Zeit und ermöglicht es, komplexe Aufgaben schneller umzusetzen. Gleichzeitig bringt das einen Aspekt mit sich, der leicht übersehen wird: Claude Code arbeitet autonom mit echten Tools. Es führt Shell-Befehle aus, legt Dateien an und erstellt Commits – oft ohne dass man jeden einzelnen Schritt aktiv bestätigt.

Das ist in der Regel genau das, was man möchte - denn wer will schon alle 10 Sekunden auf "Allow" drücken? - aber es bedeutet auch, dass Fehler mit realen Konsequenzen passieren können. Beispielsweise eine Commit-Nachricht, die den Namen eines KI-Modells als Co-Autoren nennt - was in professionellen Kontexten unerwünscht sein kann. Oder sogar einen commit, der versehentlich einen API Key enthält.

Claude Code bietet mit **Hooks** ein Feature, das genau für solche Absicherungen gemacht ist – und das meiner Kenntnis nach bislang von vielen Entwickler:innen noch kaum genutzt wird.

## 2 Hooks, Tools und Matcher

Bevor wir uns die Konfiguration anschauen, klären wir was Hooks eigentlich sind, und wie sie in Claude Code verankert sind.

Um zu entwickeln verwendet Claude Code sogenannte **Tools**.
**Tools** sind die Werkzeuge, die Claude Code verwenden darf, um Aufgaben zu erledigen. Dazu gehören unter anderem das Lesen (`Read`) und Schreiben (`Write`) von Dateien, das Ausführen von Shell-Befehlen (`Bash`) oder das Bearbeiten von bestehendem Code (`Edit`). Jeder dieser Aktionen entspricht einem Tool mit einem definierten Namen.

**Hooks** sind ausführbare Programme oder Skripte, die Claude Code zu bestimmten Zeitpunkten im Tool-Lifecycle aufruft – ähnlich wie Git Hooks, aber für Claude-Aktionen. Ein Hook kann eine Tool-Ausführung prüfen, blockieren oder durchlassen.

**Matcher** bestimmen, für welche Tools ein Hook aktiv ist. Statt jeden Tool-Aufruf zu prüfen, kann man Hooks gezielt auf bestimmte Tools beschränken – zum Beispiel nur auf `Bash`.

Es gibt verschiedene Hook-Typen, die zu unterschiedlichen Zeitpunkten greifen:

- `PreToolUse` – wird aufgerufen, **bevor** ein Tool ausgeführt wird. Kann die Ausführung blockieren.
- `PostToolUse` – wird aufgerufen, **nachdem** ein Tool ausgeführt wurde.
- `Notification` – wird aufgerufen, wenn Claude Code eine Benachrichtigung sendet.
- `Stop` – wird aufgerufen, wenn Claude Code seine Arbeit beendet.

Für Sicherheitschecks ist `PreToolUse` der relevante Typ, da nur hier eine Ausführung noch verhindert werden kann.

## 3 Konfiguration

Hooks werden in der `settings.json` von Claude Code definiert. Diese Konfigurationsdatei gibt es in mehreren Varianten - wir schauen uns die Folgenden zwei an:

**Globale Konfiguration** unter `~/.claude/settings.json` – gilt für alle Claude Code Sitzungen, unabhängig vom Projekt. Hier sind Hooks sinnvoll, die immer gelten sollen: allgemeine Sicherheitschecks, Git-Schutzmaßnahmen oder teamübergreifende Policies.

**Projektspezifische Konfiguration** in `.claude/settings.json` im Wurzelverzeichnis eines Projekts – gilt nur für dieses Projekt und wird idealerweise versioniert. Hier sind Hooks sinnvoll, die projektspezifische Tools voraussetzen, etwa Lint-Checks mit `pnpm`, Tests mit einem bestimmten Java-Build-Tool oder Formatter, die nur in diesem Repository vorhanden sind.

Es gibt für Claude Code Enterprise Kunden auch die Konfiguration auf **Organisations-Ebene**. Hier bin ich sicher, dass wir im Laufe der Zeit als adessi entsprechende Policies erhalten werden, die Tool-Uses sauber einschränken. Da die Konzepte alle noch recht neu sind, kann man das aber noch nicht erwarten. Und viele nutzen Claude Code ja auch über ohne Enterprise Lizenz, darüber geht so etwas meines Wissens nach auch nicht.

Ich lege allgemeine Hooks wie die im Folgenden beschriebenen in der globalen Konfiguration ab, da sie für jede Entwicklungssitzung relevant sind. Projekt-Hooks, die auf projektspezifische Befehle wie z.B. `pnpm lint`, `./gradlew check` oder ähnliches angewiesen sind, definiere ich hingegen auf Projektebene.

Ein Hook wird in der `settings.json` unter dem jeweiligen Hook-Typ registriert:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/mein-hook.sh",
            "statusMessage": "Überprüfe..."
          }
        ]
      }
    ]
  }
}
```

Der `matcher` gibt dabei an, für welches Tool der Hook gilt. Im Beispiel wird er für jede `Bash`-Tool-Ausführung aktiv. `"type": "command"` definiert dabei, dass der Hook als ein Befehl ausgeführt werden soll (hier das shell-script `mein-hook.sh`).

## 4 Input und Output

Claude Code kommuniziert mit Hooks über Standard-I/O. Der Ablauf ist folgender:

**Input:** Claude Code schreibt ein JSON-Objekt nach `stdin` des Hook-Prozesses. Es enthält Informationen über die bevorstehende Tool-Ausführung – beim `Bash`-Tool zum Beispiel den auszuführenden Shell-Befehl:

```json
{
  "tool_input": {
    "command": "git commit -m 'Add feature'"
  }
}
```

**Output:** Der Hook schreibt eine Entscheidung als JSON nach `stdout`. Das Format hängt vom Hook-Typ ab. Für `PreToolUse` erwartet Claude Code folgende Struktur:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", // oder "allow"
    "permissionDecisionReason": "Grund für die Ablehnung"
  }
}
```

Mögliche Werte für `permissionDecision` sind `deny` (blockiert die Ausführung) und `ask` (fragt den Nutzer nach Bestätigung), oder eben `allow`. Gibt der Hook kein JSON aus und beendet sich mit Exit-Code 0, wird das Tool normal ausgeführt.

**Wichtig:** Das Output-Format unterscheidet sich je nach Hook-Typ. `PostToolUse`-Hooks erwarten ein anderes Format als `PreToolUse`-Hooks. Die vollständigen Formatvorgaben sind in der [offiziellen Claude Code Hooks-Referenz](https://code.claude.com/docs/de/hooks) dokumentiert.

## 5 Exit Codes und Fail-Closed

Der Exit-Code eines Hooks spielt eine entscheidende Rolle für das Verhalten von Claude Code:

- **Exit 0** – Der Hook wurde erfolgreich ausgeführt. Claude Code wertet das JSON aus `stdout` aus.
- **Exit 2** – Hard Failure. Claude Code blockiert das Tool **immer**, unabhängig vom JSON-Output.
- **Beliebiger anderer Exit-Code** – Das Verhalten ist nicht definiert und kann dazu führen, dass das Tool trotzdem ausgeführt wird.

**Es ist daher ratsam, bei unerwarteten Fehlern immer mit Exit-Code 2 zu beenden.** Diese Strategie heißt „Fail Closed": Wenn der Hook nicht korrekt funktioniert, blockiert er lieber zu viel als zu wenig. Das verhindert, dass ein Fehler im Hook-Code (z. B. ein Parse-Fehler) dazu führt, dass die Sicherheitsprüfung stillschweigend umgangen wird.

```
Exit 0  → Hook erfolgreich → JSON-Entscheidung auswerten
Exit 2  → Unerwarteter Fehler → Tool immer blockieren (Fail Closed)
Andere  → Undefiniertes Verhalten → vermeiden
```

## 6 Praxisbeispiele

### check-secrets: Secrets im Commit verhindern

Der Hook `check-secrets` greift bei jedem `git commit`-Aufruf und scannt die gestagten Änderungen auf bekannte Secret-Muster: API Keys, Passwörter, Private Keys, AWS Access Keys, GitHub Personal Access Tokens oder einfach High Entropy Strings - also lange Zeichenketten, die keinem Muster folgen.

Der Ablauf:

1. Der Hook liest den Shell-Befehl aus dem JSON-Input.
2. Enthält der Befehl keinen `git commit`, beendet er sich sofort mit Exit 0 – keine Aktion nötig.
3. Andernfalls ruft er `git diff --cached` auf und scannt die Ausgabe zeilenweise gegen bekannte Muster.
4. Findet er verdächtige Zeilen, schreibt er eine `deny`-Entscheidung mit einer Fehlermeldung nach `stdout`.

Die Muster reichen von generischen Credential-Namen wie `db_password =` oder `api_key:` in Kombination mit längeren Zeichenfolgen, bis hin zu Mustern für High-Entropy-Strings mit mindestens 32 Zeichen, das unbekannte Token-Formate erkennt.

Der Scanner läuft über das `git diff --cached` – also genau das, was in den nächsten Commit gelangt. Nur hinzugefügte Zeilen (die mit `+` beginnen) werden geprüft, um False Positives auf gelöschten oder unveränderten Zeilen zu vermeiden.

Wie genau das hook script secrets klassizifiert, bleibt dabei natürlich jedem selbst überlassen - das Gute ist ja: Schlägt eine hook mal fehl, können wir den commit immer noch selber durchführen. (Heißt natürlich auch, dass secrets die von Claude eingefügt aber nicht von Claude committet werden, nicht erkannt werden) -> Schaut hier individuell, wie ihr euren workflow am liebsten habt. Wichtig ist, dass ihr ein System habt, mit dem ihr die Arbeit von Claude automatisiert überprüft. Und Claude Hooks bieten sich hier besonders an, da sie nur Claude einschränken, nicht aber euch selbst.

Kurze Notiz zu git hooks: Gute alte pre-commit hooks sind theoretisch auch ein Weg um so etwas zu enforcen. Hier ist allerdings ebenfalls Vorsicht geboten. Mein Claude Code hat beispielsweise schon versucht mit `git commit --no-verify` git pre-commit hooks zu umgehen, nachdem der commit auf regulärer Ebene fehlgeschlagen ist. Man müsste also hier die git commands noch einmal besonders einschränken, um wirklich sicher sein zu können, dass die pre-commit hooks auch tatsächlich ausgeführt werden.

Im Bild unten sieht man, wie die Hook wirkt. Hier habe ich Claude Code bei der Arbeit ein Fake-Secret untergejubelt. Claude Code hat das nicht gemerkt (!) und wollte die changes schon committen. Die Hook hat das gestoppt, und dann hat Claude Code erkannt, dass es das secret löschen muss. Man sieht also an diesem Beispiel sehr schön, dass wir nicht nur ungewünschtes Verhalten zuverlässig stoppen können - wir können auch mithilfe der Kommunikation zwischen Hooks und Claude Code einen Self-Healing Mechanismus aktivieren:

![Demo Hook - Interaktion mit Claude Code](/articles/claude-code-hooks/demo-secret-hook.png)

### check-model-author: KI als Co-Autor verhindern

Kommen wir zu einem weiteren Beispiel für hooks. Claude Code schlägt gelegentlich vor, sich selbst als Co-Autor in Commit-Nachrichten einzutragen, nach dem Muster `Co-Authored-By: Claude Sonnet <noreply@anthropic.com>`. In einigen Projekten ist das unerwünscht, – etwa bei Kunden, die den KI-Einsatz nicht exponieren wollen, oder in bestimmten Open-Source-Kontexten.

Der Hook `check-model-author` verhindert das automatisch:

1. Auch hier wird zunächst geprüft, ob es sich um einen `git commit` handelt.
2. Der vollständige Commit-Befehl wird gegen zwei Regex-Patterns geprüft:
   - Bekannte KI-Modellnamen wie `claude`, `sonnet`, `haiku`, `opus`, `gpt`, `gemini`, `llama`, `copilot`
   - Bekannte No-Reply-Adressen von KI-Diensten wie `noreply@anthropic.com` oder `noreply@openai.com`
3. Trifft eines der Muster zu, wird der Commit mit einer erklärenden Fehlermeldung blockiert.

Das Pattern ist bewusst breit gehalten, damit auch zukünftige Modellnamen (z. B. neue Claude-Versionen) automatisch erkannt werden, ohne den Hook anpassen zu müssen.


Unten sieht man wieder die Hook im Einsatz. Ich habe Claude Code den Auftrag gegeben einen commit zu machen und sich selbst dabei zu nennen. Der Commit schlägt fehl, und die Hook gibt eine Antwort an Claude Code zurück. Auch hier ist das Modell in der Lage sich der Situation anzupassen, und committet mit einer geänderten Message: 

![Demo Hook - Interaktion mit Claude Code](/articles/claude-code-hooks/demo-model-hook.png)


### Konfiguration in der globalen settings.json

In meiner globalen `~/.claude/settings.json` sind beide Hooks für den `Bash`-Matcher unter `PreToolUse` registriert:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/check-secrets.sh",
            "statusMessage": "Scanne staged Changes auf Secrets..."
          },
          {
            "type": "command",
            "command": "~/.claude/hooks/check-model-author.sh",
            "statusMessage": "Prüfe Commit-Nachricht auf KI-Co-Autoren..."
          }
        ]
      }
    ]
  }
}
```

Da beide Hooks nur bei `git commit`-Aufrufen richtig aktiv werden, haben sie keinen Einfluss auf andere Bash-Befehle und verlangsamen die normale Arbeit nicht nennenswert.

Es ist auch möglich, den Matcher noch weiter einzuschränken, sodass das hook Script nur bei bestimmten Bash Befehlen ausgeführt wird. Zum Beispiel kann man mit `"matcher": "Bash(git commit*)"` hook scripte nur ausführen, wenn der command mit `git commit` beginnt. Hier würde ich allerdings vorsichtig sein, da Claude Code gerne auch mal mehrere Kommandos hintereinander kettet (Zum Beispiel: `git add <files> && git commit -m "..."`). Ich habe bisher noch nicht genug getestet um mir sicher zu sein, dass in einem solchen Fall das Hook Script ausgeführt wird. In meinen persönlichen Hook scripts teste ich einfach mit grep ob irgendwo im command `git commit` auftaucht.

## 7 Fazit

Claude Code Hooks sind ein mächtiges, aber noch wenig genutztes Feature. Gerade wenn Claude Code produktiv und autonom eingesetzt wird, schaffen Hooks die Möglichkeit, kritische Invarianten durchzusetzen – unabhängig davon, was Claude in einer Sitzung vorschlägt oder ausführt.

Zwei Prinzipien sollte man dabei im Kopf behalten:

**Fail Closed statt Fail Open.** Hooks, die bei unerwarteten Fehlern mit Exit 2 enden, blockieren lieber zu viel als zu wenig. Das verhindert, dass ein kaputtes Sicherheitsnetz zur falschen Sicherheit führt.

**Global vs. projektspezifisch.** Allgemeine Checks wie Secret-Scanning oder Commit-Policies gehören in die globale Konfiguration. Projektspezifische Checks, die bestimmte Laufzeitumgebungen oder Build-Tools voraussetzen, gehören in die `.claude/settings.json` des jeweiligen Projekts.

Der Einstieg ist niedrigschwellig: Ein Hook ist im Grunde nur ein ausführbares Programm, das JSON liest und JSON schreibt. Ob Shell-Skript, Go-Binary oder Python-Skript – das Format ist das Entscheidende, nicht die Sprache. Wer Claude Code bereits in echten Projekten nutzt, sollte Hooks fest in seinen Workflow integrieren.

Policies für commits sowie secrets können im Allgemeinen natürlich auch in der `CLAUDE.MD` hinterlegt werden. Claude respektiert das recht gut. Hooks bieten aber natürlich einen erweiterten Sicherheits-layer, der sich lohnen kann - vor allem da LLM's nicht deterministisch handeln und in ihrem Fokus teilweise sehr auf ihre aktuelle Aufgabe eingeschossen sind.

Weiter sei gesagt, dass die genannten Beispiele und Lifecycle Punkte nur ein Bruchteil dessen sind, was mit Hooks möglich ist. Wir können beispielsweise auch Notifications senden wenn Claude Code Input braucht, automatisch Formatter nach Edits laufen lassen, und und und...

Wer tiefer einsteigen möchte, findet die vollständige Referenz zu allen Hook-Typen, Matchern und Output-Formaten in der [offiziellen Claude Code Dokumentation](https://code.claude.com/docs/de/hooks). Happy "Vibe Coding".
