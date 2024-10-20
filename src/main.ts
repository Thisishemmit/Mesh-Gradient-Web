import './style.css'
import { GFX } from './lib/GFX'

const gfx = new GFX('gfx')
gfx.curvableSquare(10, 10, 100, 100)
gfx.draw()

