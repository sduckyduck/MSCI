# Character builder assets

The result card can load layered character assets from this folder.

Folder structure expected by the app:

```text
public/character-assets/
  body/
  face/
  expression/
  hair/
  nx/
  weapon/
  accessory/
```

Each PNG should use the same canvas size and alignment so layers stack correctly.

Current option filenames:

## body

```text
male.png
female.png
```

## hair

```text
short-black.png
side-bangs.png
twin-buns.png
long-black.png
```

## face

```text
sharp.png
cute.png
calm.png
sleepy.png
```

## expression

```text
neutral.png
smile.png
cool.png
angry.png
```

## nx

```text
starter.png
mage-purple.png
priest-mint.png
rogue-night.png
archer-green.png
knight-blue.png
toxic-lab.png
```

## weapon

```text
sword.png
spear.png
staff.png
bow.png
crossbow.png
dagger.png
throwing-star.png
```

## accessory

```text
cap.png
hood.png
scarf.png
wizard-hat.png
halo.png
```

If a file is missing, the app shows the CSS fallback avatar instead of breaking.

Important: only add MeowDB / MapleStory assets here if you have permission to use and redistribute them. Otherwise, use your own generated or original assets with the same filenames.
