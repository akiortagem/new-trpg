# Reusable Main Characters

Store reusable main-character JSON files in this directory when keeping them in the repository. The app also accepts a valid character file from anywhere on the player's device.

Adventures must not require a particular main-character id. They refer to the selected character through the special `$main` id. The selected main character is combined with the companions embedded in the adventure file for that run.

Main-character files are read-only templates in this version. Saves contain a snapshot of the current run, but completing an adventure does not modify the original character file or carry advancement into another adventure.

See [../AUTHORING.md](../AUTHORING.md#character-files) for the complete format.
