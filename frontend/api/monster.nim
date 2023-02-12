import pixie, perlin

proc addHead(ctx: Context, seed: uint32);
proc addHands(ctx: Context, seed: uint32);
proc addBody(ctx: Context, seed: uint32);
proc addLegs(ctx: Context, seed: uint32);
proc addColor(ctx: Context, seed: uint32);

const 
    PreStyleFill = rgba(255, 255, 255, 255)
    StyleRed = rgba(255, 0, 0, 255)
    StyleGreen = rgba(0, 255, 0, 255)
    StyleBlue =  rgba(0, 0, 255, 255)

var handPatterns: seq[int]

proc renderMonster*(seed: int): string =
    let image = newImage(12, 12)
    image.fill(rgba(255, 255, 255, 0))
    let ctx = newContext(image)
    ctx.addHead(seed.uint32)
    ctx.addHands(seed.uint32)
    ctx.addBody(seed.uint32)
    ctx.addLegs(seed.uint32)
    ctx.addColor(seed.uint32)
    return image.encodeImage(FileFormat.PngFormat)

proc renderParticle*(seed: int): string =
    let image = newImage(3, 3)
    image.fill(rgba(255, 255, 255, 0))
    let ctx = newContext(image)
    return image.encodeImage(FileFormat.PngFormat)

proc renderSword*(seed: int): string =
    let image = newImage(3, 3)
    image.fill(rgba(255, 255, 255, 0))
    let ctx = newContext(image)
    return image.encodeImage(FileFormat.PngFormat)

proc addHead(ctx: Context, seed: uint32): void =
    ctx.fillStyle = PreStyleFill
    ctx.fillRect(rect(vec2(2, 2), vec2(8, 8)))

proc addHands(ctx: Context, seed: uint32): void =
    ctx.fillStyle = PreStyleFill
    echo ""

proc addBody(ctx: Context, seed: uint32): void =
    ctx.fillStyle = PreStyleFill
    echo ""

proc addLegs(ctx: Context, seed: uint32): void =
    ctx.fillStyle = PreStyleFill
    echo ""

proc addColor(ctx: Context, seed: uint32): void =
    echo ""