import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Download,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

const TFJS_CDN = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
const BLAZEFACE_CDN =
  "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.umd.js"

const APP_BG = "#FDF8F5"
const APP_TEXT = "#2D2D2D"

const paletteMap = {
  fair_cool: {
    staples: [
      { hex: "#F4EEF7", name: "Icy Lavender" },
      { hex: "#DCEBFA", name: "Powder Blue" },
      { hex: "#EED7E8", name: "Rose Mist" },
      { hex: "#BFD1F0", name: "Soft Sky" },
    ],
    accents: [
      { hex: "#6E85B7", name: "Slate Blue" },
      { hex: "#8FA8D8", name: "Periwinkle" },
      { hex: "#C95E8D", name: "Cool Rose" },
      { hex: "#88B8C4", name: "Sea Glass" },
    ],
    avoid: [
      { hex: "#F4A261", name: "Orange" },
      { hex: "#D4A017", name: "Mustard" },
      { hex: "#8C6B4F", name: "Warm Brown" },
      { hex: "#7A4E2D", name: "Rust" },
    ],
  },
  fair_warm: {
    staples: [
      { hex: "#F7E7D2", name: "Peach Cream" },
      { hex: "#FFF0D1", name: "Butter Cream" },
      { hex: "#F6D6C8", name: "Warm Blush" },
      { hex: "#F2E1B6", name: "Golden Mist" },
    ],
    accents: [
      { hex: "#D89A5B", name: "Apricot" },
      { hex: "#C98B64", name: "Warm Tan" },
      { hex: "#E8B98A", name: "Honey Peach" },
      { hex: "#B96E4E", name: "Terracotta" },
    ],
    avoid: [
      { hex: "#8A8F99", name: "Cool Grey" },
      { hex: "#B7C4D1", name: "Steel Blue" },
      { hex: "#6F7A86", name: "Slate" },
      { hex: "#A7B0B8", name: "Silver Mist" },
    ],
  },
  light_cool: {
    staples: [
      { hex: "#D8C6DA", name: "Dusty Mauve" },
      { hex: "#C8D9D3", name: "Soft Sage" },
      { hex: "#B8C7E6", name: "Slate Blue" },
      { hex: "#F1D8E6", name: "Powder Pink" },
    ],
    accents: [
      { hex: "#7C8FA9", name: "Blue Grey" },
      { hex: "#8CA2A8", name: "Willow" },
      { hex: "#A46D8C", name: "Plum Mauve" },
      { hex: "#D38EA8", name: "Cool Rose" },
    ],
    avoid: [
      { hex: "#D8FF00", name: "Neon Lime" },
      { hex: "#111111", name: "Harsh Black" },
      { hex: "#FF5A00", name: "Hot Orange" },
      { hex: "#FF2E63", name: "Electric Coral" },
    ],
  },
  light_warm: {
    staples: [
      { hex: "#D48B62", name: "Terracotta" },
      { hex: "#F3C77A", name: "Apricot Gold" },
      { hex: "#F4E6D3", name: "Warm White" },
      { hex: "#C7A37A", name: "Camel" },
    ],
    accents: [
      { hex: "#E3A08B", name: "Peach Clay" },
      { hex: "#D9B25F", name: "Golden Apricot" },
      { hex: "#B87A52", name: "Cinnamon" },
      { hex: "#EABF9F", name: "Soft Caramel" },
    ],
    avoid: [
      { hex: "#B9D8E8", name: "Cool Pastel Blue" },
      { hex: "#A3C4A8", name: "Mint Wash" },
      { hex: "#D5DDEB", name: "Ice Grey" },
      { hex: "#D9CCE5", name: "Lilac Mist" },
    ],
  },
  medium_cool: {
    staples: [
      { hex: "#2B4C9B", name: "Sapphire" },
      { hex: "#157A6E", name: "Emerald" },
      { hex: "#C43C76", name: "Fuchsia" },
      { hex: "#C52D2D", name: "Cool Red" },
    ],
    accents: [
      { hex: "#4E6FAF", name: "Blue Ink" },
      { hex: "#5F9EA0", name: "Teal Mist" },
      { hex: "#8D6AAE", name: "Amethyst" },
      { hex: "#B75B9A", name: "Berry Pink" },
    ],
    avoid: [
      { hex: "#8B6B4F", name: "Muted Brown" },
      { hex: "#9C7A5A", name: "Warm Clay" },
      { hex: "#A16A43", name: "Beige Brown" },
      { hex: "#6F5642", name: "Coffee" },
    ],
  },
  medium_warm: {
    staples: [
      { hex: "#A45C3B", name: "Burnt Sienna" },
      { hex: "#7C8A3A", name: "Warm Olive" },
      { hex: "#B05A3C", name: "Rust" },
      { hex: "#B47A3A", name: "Golden Brown" },
    ],
    accents: [
      { hex: "#D08A5B", name: "Copper" },
      { hex: "#E3A35F", name: "Honey Clay" },
      { hex: "#8E603B", name: "Cocoa" },
      { hex: "#C76E4A", name: "Spice" },
    ],
    avoid: [
      { hex: "#DCEBFA", name: "Icy Pastel Blue" },
      { hex: "#D8DCEB", name: "Cool Lilac" },
      { hex: "#C4D9EF", name: "Pale Sky" },
      { hex: "#E8F0F8", name: "Frost" },
    ],
  },
  tan_cool: {
    staples: [
      { hex: "#1F4BA5", name: "Cobalt" },
      { hex: "#C0007A", name: "Magenta" },
      { hex: "#FAFAFA", name: "True White" },
      { hex: "#7A1F5C", name: "Burgundy" },
    ],
    accents: [
      { hex: "#3D6FB4", name: "Azure" },
      { hex: "#AF4B9C", name: "Orchid" },
      { hex: "#6A78A7", name: "Mist Blue" },
      { hex: "#9E3D58", name: "Rose Wine" },
    ],
    avoid: [
      { hex: "#D8C3A5", name: "Beige" },
      { hex: "#BFAE8F", name: "Khaki" },
      { hex: "#C9B08E", name: "Sand" },
      { hex: "#B69D77", name: "Warm Taupe" },
    ],
  },
  tan_warm: {
    staples: [
      { hex: "#D4A017", name: "Mustard" },
      { hex: "#C6783B", name: "Copper Orange" },
      { hex: "#D19A5A", name: "Warm Caramel" },
      { hex: "#8A5A3B", name: "Toffee" },
    ],
    accents: [
      { hex: "#E2B35A", name: "Golden Grain" },
      { hex: "#B66A2E", name: "Saffron Clay" },
      { hex: "#C98A4A", name: "Amber" },
      { hex: "#A87342", name: "Maple" },
    ],
    avoid: [
      { hex: "#B0B6C1", name: "Cool Grey" },
      { hex: "#8FA8D8", name: "Cold Blue" },
      { hex: "#C9D7E8", name: "Blue Mist" },
      { hex: "#C2D5D9", name: "Steel Sage" },
    ],
  },
  deep_cool: {
    staples: [
      { hex: "#123E8A", name: "Royal Blue" },
      { hex: "#6B2CA4", name: "Violet" },
      { hex: "#F52E8A", name: "Hot Pink" },
      { hex: "#F8F8F8", name: "Crisp White" },
    ],
    accents: [
      { hex: "#175DDC", name: "Electric Blue" },
      { hex: "#A93BD6", name: "Cool Purple" },
      { hex: "#0F7C8D", name: "Blue Teal" },
      { hex: "#D73D92", name: "Berry Neon" },
    ],
    avoid: [
      { hex: "#6C584C", name: "Muddy Brown" },
      { hex: "#7A6356", name: "Earth Brown" },
      { hex: "#8B6D5C", name: "Silt" },
      { hex: "#5B4A42", name: "Cocoa Ash" },
    ],
  },
  deep_warm: {
    staples: [
      { hex: "#6E1F35", name: "Deep Burgundy" },
      { hex: "#C45A1A", name: "Burnt Orange" },
      { hex: "#B87333", name: "Copper" },
      { hex: "#D4AF37", name: "Warm Gold" },
    ],
    accents: [
      { hex: "#8F2D56", name: "Mulberry" },
      { hex: "#D27B2A", name: "Amber Spice" },
      { hex: "#9B4F1B", name: "Cinnamon Bark" },
      { hex: "#E2B44C", name: "Honey Gold" },
    ],
    avoid: [
      { hex: "#EED7E8", name: "Pastel Pink" },
      { hex: "#DDEBF8", name: "Powder Blue" },
      { hex: "#E8F0D9", name: "Pale Mint" },
      { hex: "#F0E6FF", name: "Lavender Mist" },
    ],
  },
  rich_cool: {
    staples: [
      { hex: "#005BFF", name: "Electric Blue" },
      { hex: "#D100C2", name: "Fuchsia" },
      { hex: "#F8FAFF", name: "Bright White" },
      { hex: "#6D28D9", name: "Cool Purple" },
    ],
    accents: [
      { hex: "#1C77FF", name: "Cobalt Pop" },
      { hex: "#B5179E", name: "Plum Neon" },
      { hex: "#14B8A6", name: "Aqua Flash" },
      { hex: "#3B82F6", name: "Sky Electric" },
    ],
    avoid: [
      { hex: "#8D6E63", name: "Earth Tone" },
      { hex: "#A67C52", name: "Sand Brown" },
      { hex: "#7A674F", name: "Olive Brown" },
      { hex: "#9C8C7A", name: "Khaki Grey" },
    ],
  },
  rich_warm: {
    staples: [
      { hex: "#5A1F2B", name: "Mahogany" },
      { hex: "#D9891F", name: "Amber" },
      { hex: "#B43A2B", name: "Warm Red" },
      { hex: "#F3D28C", name: "Champagne Gold" },
    ],
    accents: [
      { hex: "#7A2E2E", name: "Wine" },
      { hex: "#C67B11", name: "Burnished Gold" },
      { hex: "#E07A2F", name: "Saffron" },
      { hex: "#9B5B2E", name: "Spiced Walnut" },
    ],
    avoid: [
      { hex: "#DCEBFA", name: "Cool White" },
      { hex: "#C9D5E8", name: "Blue Grey" },
      { hex: "#E3EEF7", name: "Ice" },
      { hex: "#D9DDE7", name: "Frost Grey" },
    ],
  },
}

const copyFallback = async (text) => {
  const el = document.createElement("textarea")
  el.value = text
  el.setAttribute("readonly", "true")
  el.style.position = "fixed"
  el.style.opacity = "0"
  document.body.appendChild(el)
  el.select()
  try {
    document.execCommand("copy")
  } finally {
    document.body.removeChild(el)
  }
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`

const rgbToHsv = (r, g, b) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let hue = 0
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6
    else if (max === gn) hue = (bn - rn) / delta + 2
    else hue = (rn - gn) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  const saturation = max === 0 ? 0 : delta / max
  const value = max
  return { h: hue, s: saturation, v: value }
}

const rgbToHsl = (r, g, b) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let hue = 0
  let lightness = (max + min) / 2
  let saturation = 0
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))
    if (max === rn) hue = ((gn - bn) / delta) % 6
    else if (max === gn) hue = (bn - rn) / delta + 2
    else hue = (rn - gn) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { h: hue, s: saturation, l: lightness }
}

const hslToDepth = (lightness) => {
  if (lightness > 0.78) return "fair"
  if (lightness >= 0.65) return "light"
  if (lightness >= 0.52) return "medium"
  if (lightness >= 0.4) return "tan"
  if (lightness >= 0.27) return "deep"
  return "rich"
}

const hslToUndertone = (h, s) => {
  const hue = (h + 360) % 360
  const warm = (hue >= 20 && hue <= 50) && s > 0.25
  const cool = ((hue >= 340 && hue <= 360) || (hue >= 0 && hue < 20)) && s > 0.2
  if (s < 0.15) return "warm"
  if (warm) return "warm"
  if (cool) return "cool"
  return "warm"
}

const getPaletteKey = (depth, undertone) => `${depth}_${undertone}`

const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = Array.from(document.querySelectorAll("script")).find((s) => s.src === src)
    if (existing && (existing.dataset.loaded === "true" || window.tf || window.blazeface)) {
      resolve()
      return
    }
    const script = existing || document.createElement("script")
    const finish = () => {
      script.dataset.loaded = "true"
      resolve()
    }
    script.src = src
    script.async = true
    script.onload = finish
    script.onerror = reject
    if (!existing) document.head.appendChild(script)
  })

let stackPromise = null

const loadAnalysisStack = async () => {
  if (stackPromise) return stackPromise
  stackPromise = (async () => {
    try {
      await loadScript(TFJS_CDN)
      await loadScript(BLAZEFACE_CDN)
      if (window.tf?.ready) await window.tf.ready()
      return { tf: window.tf, blazeface: window.blazeface }
    } catch (error) {
      stackPromise = null
      throw error
    }
  })()
  return stackPromise
}

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ img, url })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image could not be loaded"))
    }
    img.src = url
  })

const sampleRectPixels = (ctx, rect, canvasWidth, canvasHeight) => {
  const x = clamp(Math.round(rect.x), 0, canvasWidth - 1)
  const y = clamp(Math.round(rect.y), 0, canvasHeight - 1)
  const w = clamp(Math.round(rect.w), 1, canvasWidth - x)
  const h = clamp(Math.round(rect.h), 1, canvasHeight - y)
  const data = ctx.getImageData(x, y, w, h).data
  const pixels = []
  let sumV = 0
  let pixelCount = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 200) continue
    const hsv = rgbToHsv(r, g, b)
    sumV += hsv.v
    pixelCount += 1
    if (hsv.h >= 0 && hsv.h <= 50 && hsv.s >= 0.1 && hsv.s <= 0.8 && hsv.v >= 0.2 && hsv.v <= 0.95) {
      pixels.push([r, g, b])
    }
  }
  return { pixels, avgV: pixelCount ? sumV / pixelCount : 0, count: pixelCount }
}

const computeFallbackZone = (canvasWidth, canvasHeight) => ({
  x: canvasWidth * 0.4,
  y: canvasHeight * 0.4,
  w: canvasWidth * 0.2,
  h: canvasHeight * 0.2,
})

const computeZones = (face, canvasWidth, canvasHeight) => {
  if (!face?.topLeft || !face?.bottomRight) {
    return { fallback: computeFallbackZone(canvasWidth, canvasHeight) }
  }

  const [x1, y1] = face.topLeft
  const [x2, y2] = face.bottomRight
  const faceW = Math.max(1, x2 - x1)
  const faceH = Math.max(1, y2 - y1)
  const landmarks = face.landmarks || []
  const orderedEyes = (landmarks.slice(0, 2) || []).slice().sort((a, b) => a[0] - b[0])
  const leftEye = orderedEyes[0] || [x1 + faceW * 0.32, y1 + faceH * 0.36]
  const rightEye = orderedEyes[1] || [x1 + faceW * 0.68, y1 + faceH * 0.36]
  const nose = landmarks[2] || [x1 + faceW * 0.5, y1 + faceH * 0.52]
  const eyeMidX = (leftEye[0] + rightEye[0]) / 2
  const eyeMidY = (leftEye[1] + rightEye[1]) / 2
  const patchSize = Math.max(12, Math.min(faceW, faceH) * 0.15)

  return {
    forehead: {
      x: x1 + faceW * 0.3,
      y: y1 + faceH * 0.02,
      w: faceW * 0.4,
      h: faceH * 0.22,
    },
    leftCheek: {
      x: clamp(leftEye[0] - patchSize * 1.1, 0, canvasWidth - patchSize),
      y: clamp(leftEye[1] + faceH * 0.18, 0, canvasHeight - patchSize),
      w: patchSize,
      h: patchSize,
    },
    rightCheek: {
      x: clamp(rightEye[0] - patchSize * 0.2, 0, canvasWidth - patchSize),
      y: clamp(rightEye[1] + faceH * 0.18, 0, canvasHeight - patchSize),
      w: patchSize,
      h: patchSize,
    },
    noseBridge: {
      x: clamp(eyeMidX - patchSize * 0.35, 0, canvasWidth - patchSize),
      y: clamp(eyeMidY + faceH * 0.1, 0, canvasHeight - patchSize),
      w: Math.max(10, Math.min(faceW, faceH) * 0.1),
      h: Math.max(10, Math.min(faceW, faceH) * 0.1),
    },
    noseAnchor: nose,
  }
}

const chooseKMeansPlusPlus = (points, k) => {
  const centroids = []
  centroids.push(points[Math.floor(Math.random() * points.length)])
  while (centroids.length < k) {
    const distances = points.map((p) => {
      let min = Infinity
      for (const c of centroids) {
        const dx = p[0] - c[0]
        const dy = p[1] - c[1]
        const dz = p[2] - c[2]
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < min) min = d2
      }
      return min
    })
    const total = distances.reduce((sum, value) => sum + value, 0) || 1
    let target = Math.random() * total
    let picked = points[0]
    for (let i = 0; i < points.length; i += 1) {
      target -= distances[i]
      if (target <= 0) {
        picked = points[i]
        break
      }
    }
    centroids.push(picked)
  }
  return centroids
}

const runKMeans = async (points, tf, k = 3, maxIterations = 20) => {
  if (!points.length) return null
  const initial = chooseKMeansPlusPlus(points, k)
  let centroids = tf.tensor2d(initial, [k, 3], "float32")
  let assignments = new Array(points.length).fill(0)
  let counts = new Array(k).fill(0)
  try {
    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const assignmentTensor = tf.tidy(() => {
        const data = tf.tensor2d(points, [points.length, 3], "float32")
        const distances = tf.norm(data.expandDims(1).sub(centroids.expandDims(0)), "euclidean", 2)
        return distances.argMin(1)
      })

      assignments = Array.from(await assignmentTensor.data())
      assignmentTensor.dispose()

      const centroidArray = await centroids.array()
      const nextCentroids = []
      counts = new Array(k).fill(0)

      for (let clusterIndex = 0; clusterIndex < k; clusterIndex += 1) {
        const clusterPoints = []
        for (let i = 0; i < assignments.length; i += 1) {
          if (assignments[i] === clusterIndex) clusterPoints.push(points[i])
        }
        counts[clusterIndex] = clusterPoints.length
        if (!clusterPoints.length) {
          nextCentroids.push(centroidArray[clusterIndex])
          continue
        }

        const mean = tf.tidy(() => {
          const clusterTensor = tf.tensor2d(clusterPoints, [clusterPoints.length, 3], "float32")
          return tf.moments(clusterTensor, 0).mean
        })
        const meanArray = Array.from(await mean.data())
        mean.dispose()
        nextCentroids.push(meanArray)
      }

      const nextTensor = tf.tensor2d(nextCentroids, [k, 3], "float32")
      const shift = tf.tidy(() => tf.norm(nextTensor.sub(centroids), "euclidean").dataSync()[0])
      centroids.dispose()
      centroids = nextTensor
      if (shift < 0.5) break
    }
    const centroidArray = await centroids.array()
    let winner = 0
    counts.forEach((count, index) => {
      if (count > counts[winner]) winner = index
    })
    return {
      rgb: centroidArray[winner].map((value) => clamp(Math.round(value), 0, 255)),
      counts,
    }
  } finally {
    centroids.dispose()
  }
}

const buildAnalysisSummary = (depth, undertone) => {
  const depthCopy = {
    fair: "very light",
    light: "light",
    medium: "mid-depth",
    tan: "tan",
    deep: "deep",
    rich: "rich",
  }
  const undertoneCopy = {
    warm: "warm",
    cool: "cool",
  }
  return `Your skin reads as ${depthCopy[depth] || depth} with a ${undertoneCopy[undertone] || undertone} undertone. The palette below is built to keep the face visually balanced while giving you both reliable neutrals and stronger accent options.`
}

const createPaletteDownloadCanvas = (result, toneHex, summary) => {
  const swatchWidth = 170
  const swatchHeight = 110
  const leftPad = 40
  const topPad = 40
  const rowGap = 26
  const sectionGap = 44
  const sectionHeight = swatchHeight + 66
  const width = 1160
  const height = topPad + 210 + sectionHeight * 3 + rowGap * 2 + sectionGap * 2
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = APP_BG
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = APP_TEXT
  ctx.font = "bold 46px Georgia, serif"
  ctx.fillText("PaletteIQ V2", leftPad, 70)
  ctx.font = "24px Inter, Arial, sans-serif"
  ctx.fillStyle = "#666"
  ctx.fillText(summary, leftPad, 114)

  ctx.fillStyle = "#fff"
  roundRect(ctx, leftPad, 150, width - leftPad * 2, 170, 28)
  ctx.fill()
  ctx.strokeStyle = "#EDD7DD"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = "#777"
  ctx.font = "18px Inter, Arial, sans-serif"
  ctx.fillText("Representative skin tone", leftPad + 28, 188)
  ctx.fillStyle = toneHex
  roundRect(ctx, leftPad + 28, 204, 250, 88, 18)
  ctx.fill()
  ctx.fillStyle = APP_TEXT
  ctx.font = "bold 30px monospace"
  ctx.fillText(toneHex, leftPad + 300, 256)
  ctx.font = "18px Inter, Arial, sans-serif"
  ctx.fillStyle = "#666"
  ctx.fillText(`${result.depth} · ${result.undertone}`, leftPad + 300, 286)

  let y = 360
  const sections = [
    ["Wardrobe Staples", result.palette.staples],
    ["Accent Colors", result.palette.accents],
    ["Colors to Avoid", result.palette.avoid],
  ]

  sections.forEach(([title, items]) => {
    ctx.fillStyle = APP_TEXT
    ctx.font = "bold 24px Georgia, serif"
    ctx.fillText(title, leftPad, y)
    let x = leftPad
    items.forEach((item) => {
      ctx.fillStyle = item.hex
      roundRect(ctx, x, y + 24, swatchWidth, swatchHeight, 18)
      ctx.fill()
      ctx.fillStyle = APP_TEXT
      ctx.font = "bold 18px Inter, Arial, sans-serif"
      ctx.fillText(item.name, x + 10, y + 156)
      ctx.font = "16px monospace"
      ctx.fillText(item.hex, x + 10, y + 178)
      x += 210
    })
    y += sectionHeight + rowGap
  })

  return canvas
}

function SwatchCard({ color, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(color.hex)}
      className="w-[152px] text-left"
      title={`Copy ${color.hex}`}
    >
      <div
        className="h-[108px] w-full rounded-[16px] border border-black/5 shadow-sm"
        style={{ backgroundColor: color.hex }}
      />
      <div className="mt-3 space-y-1">
        <div className="font-mono text-[12px] tracking-normal text-[#454545]">{color.hex}</div>
        <div className="text-[13px] font-medium text-[#2D2D2D]">{color.name}</div>
      </div>
    </button>
  )
}

function SectionRow({ title, items, onCopy }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-[20px] font-semibold text-[#2D2D2D]"
          style={{ fontFamily: "Georgia, Cambria, Times New Roman, serif" }}
        >
          {title}
        </h3>
        <div className="text-[12px] uppercase tracking-[0.16em] text-[#8B7D7A]">
          Tap any swatch to copy
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <SwatchCard key={`${title}-${item.hex}`} color={item} onCopy={onCopy} />
        ))}
      </div>
    </section>
  )
}

export default function PaletteIQ() {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const hiddenImageCanvasRef = useRef(null)
  const analysisRunId = useRef(0)
  const webcamStreamRef = useRef(null)
  const cleanupImageUrlRef = useRef(null)

  const [stackReady, setStackReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [loadProgress, setLoadProgress] = useState(8)
  const [mode, setMode] = useState("landing")
  const [stage, setStage] = useState("Preparing your color analysis...")
  const [uploadError, setUploadError] = useState("")
  const [analysisError, setAnalysisError] = useState("")
  const [analysisWarning, setAnalysisWarning] = useState("")
  const [toast, setToast] = useState("")
  const [toastKind, setToastKind] = useState("success")
  const [previewUrl, setPreviewUrl] = useState("")
  const [webcamActive, setWebcamActive] = useState(false)
  const [webcamDenied, setWebcamDenied] = useState(false)
  const [result, setResult] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  const showToast = useCallback((message, kind = "success") => {
    setToast(message)
    setToastKind(kind)
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => setToast(""), 2400)
  }, [])

  const stopWebcam = useCallback(() => {
    webcamStreamRef.current?.getTracks?.().forEach((track) => track.stop())
    webcamStreamRef.current = null
    setWebcamActive(false)
  }, [])

  useEffect(() => {
    let mounted = true
    setMode("landing")
    const start = async () => {
      try {
        setLoadProgress(15)
        const promise = loadAnalysisStack()
        setLoadProgress(35)
        await promise
        if (!mounted) return
        setLoadProgress(100)
        setStackReady(true)
      } catch (error) {
        if (!mounted) return
        setLoadError(error?.message || "Couldn't load the analysis model.")
      }
    }
    const timer = window.setTimeout(start, 80)
    return () => {
      mounted = false
      window.clearTimeout(timer)
      stopWebcam()
      if (cleanupImageUrlRef.current) URL.revokeObjectURL(cleanupImageUrlRef.current)
    }
  }, [stopWebcam])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(""), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!webcamActive || !videoRef.current) return undefined
    const video = videoRef.current
    let cancelled = false
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        webcamStreamRef.current = stream
        video.srcObject = stream
        await video.play()
      } catch (error) {
        setWebcamDenied(true)
        setWebcamActive(false)
        showToast("Camera permission was denied. Upload is still available.", "error")
      }
    }
    start()
    return () => {
      cancelled = true
    }
  }, [webcamActive, showToast])

  const resetAnalysis = useCallback(() => {
    setResult(null)
    setAnalysisError("")
    setAnalysisWarning("")
    setUploadError("")
    setMode("landing")
    stopWebcam()
  }, [stopWebcam])

  const processImage = useCallback(
    async (image, sourceLabel = "Uploaded photo") => {
      if (!stackReady) {
        setAnalysisError("The analysis stack is still loading.")
        return
      }
      const runId = ++analysisRunId.current
      setMode("analysis")
      setLoadingAnalysis(true)
      setStage("Detecting face...")
      setAnalysisError("")
      setAnalysisWarning("")
      setResult(null)
      try {
        const { tf, blazeface } = await loadAnalysisStack()
        const canvas = hiddenImageCanvasRef.current
        if (!canvas) throw new Error("Canvas unavailable")
        canvas.width = image.naturalWidth || image.videoWidth || image.width
        canvas.height = image.naturalHeight || image.videoHeight || image.height
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) throw new Error("Canvas context unavailable")
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        const estimator = await blazeface.load()
        if (analysisRunId.current !== runId) return
        const faces = await estimator.estimateFaces(image, false)
        if (analysisRunId.current !== runId) return

        setStage("Analysing skin tone...")

        const face = faces?.[0]
        const zones = computeZones(face, canvas.width, canvas.height)
        const zoneRects = zones.fallback ? [zones.fallback] : [zones.forehead, zones.leftCheek, zones.rightCheek, zones.noseBridge]
        const allPixels = []
        let avgVTotal = 0
        let avgVCount = 0

        zoneRects.forEach((rect) => {
          const sample = sampleRectPixels(ctx, rect, canvas.width, canvas.height)
          avgVTotal += sample.avgV * sample.count
          avgVCount += sample.count
          allPixels.push(...sample.pixels)
        })

        const averageV = avgVCount ? avgVTotal / avgVCount : 0
        if (averageV < 0.2) {
          setMode("landing")
          setAnalysisError("Photo is too dark - try a well-lit selfie")
          return
        }
        if (averageV > 0.95) {
          setMode("landing")
          setAnalysisError("Photo is overexposed - try moving out of direct sunlight")
          return
        }

        let pixelsToCluster = allPixels
        if (allPixels.length < 50) {
          setAnalysisWarning("Limited skin data - result may be approximate")
          pixelsToCluster = []
          zoneRects.forEach((rect) => {
            const x = clamp(Math.round(rect.x), 0, canvas.width - 1)
            const y = clamp(Math.round(rect.y), 0, canvas.height - 1)
            const w = clamp(Math.round(rect.w), 1, canvas.width - x)
            const h = clamp(Math.round(rect.h), 1, canvas.height - y)
            const data = ctx.getImageData(x, y, w, h).data
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] < 200) continue
              pixelsToCluster.push([data[i], data[i + 1], data[i + 2]])
            }
          })
        }

        if (!faces?.length) {
          setAnalysisWarning("We couldn't detect a face - results may be less accurate")
        }

        setStage("Matching palette...")
        const clustered = await runKMeans(pixelsToCluster, tf, 3, 20)
        if (analysisRunId.current !== runId) return
        if (!clustered) {
          setAnalysisError("No usable skin pixels were found in the image.")
          return
        }

        const toneRgb = clustered.rgb
        const toneHex = rgbToHex(...toneRgb)
        const toneHsl = rgbToHsl(...toneRgb)
        const depth = hslToDepth(toneHsl.l)
        const undertone = hslToUndertone(toneHsl.h, toneHsl.s)
        const paletteKey = getPaletteKey(depth, undertone)
        const palette = paletteMap[paletteKey] || paletteMap.medium_warm
        const summary = buildAnalysisSummary(depth, undertone)

        setResult({
          sourceLabel,
          toneRgb,
          toneHex,
          toneHsl,
          depth,
          undertone,
          paletteKey,
          palette,
          summary,
        })
        setMode("results")
      } catch (error) {
        if (analysisRunId.current === runId) {
          setAnalysisError(error?.message || "Analysis failed.")
        }
      } finally {
        if (analysisRunId.current === runId) setLoadingAnalysis(false)
      }
    },
    [stackReady]
  )

  const handleFile = useCallback(
    async (file) => {
      setUploadError("")
      if (!file) return
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setUploadError("Please use a JPEG or PNG file.")
        return
      }
      try {
        const { img, url } = await loadImageFromFile(file)
        if (img.naturalWidth < 100 || img.naturalHeight > 8000) {
          URL.revokeObjectURL(url)
          setUploadError("Image dimensions are not suitable for analysis.")
          return
        }
        if (cleanupImageUrlRef.current) URL.revokeObjectURL(cleanupImageUrlRef.current)
        cleanupImageUrlRef.current = url
        setPreviewUrl(url)
        setMode("landing")
        await processImage(img, file.name || "Uploaded photo")
      } catch (error) {
        setUploadError(error?.message || "Unable to load the selected image.")
      }
    },
    [processImage]
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files?.[0]
      handleFile(file)
    },
    [handleFile]
  )

  const captureFromWebcam = useCallback(async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    if (!video.videoWidth || !video.videoHeight) {
      showToast("Camera feed is not ready yet.", "error")
      return
    }
    const captureCanvas = document.createElement("canvas")
    captureCanvas.width = video.videoWidth
    captureCanvas.height = video.videoHeight
    const captureCtx = captureCanvas.getContext("2d")
    if (!captureCtx) {
      showToast("Camera capture failed.", "error")
      return
    }
    captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)
    const dataUrl = captureCanvas.toDataURL("image/png")
    const img = new Image()
    img.onload = async () => {
      setPreviewUrl(dataUrl)
      await processImage(img, "Webcam capture")
    }
    img.src = dataUrl
    stopWebcam()
  }, [processImage, stopWebcam])

  const onFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      if (file) handleFile(file)
      event.target.value = ""
    },
    [handleFile]
  )

  const copyHex = useCallback(async (hex) => {
    try {
      await navigator.clipboard.writeText(hex)
    } catch {
      await copyFallback(hex)
    }
    showToast(`Copied ${hex}`)
  }, [showToast])

  const copyAllHex = useCallback(async () => {
    if (!result) return
    const payload = [
      result.toneHex,
      ...result.palette.staples.map((item) => item.hex),
      ...result.palette.accents.map((item) => item.hex),
      ...result.palette.avoid.map((item) => item.hex),
    ].join("\n")
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      await copyFallback(payload)
    }
    showToast("Copied all hex codes")
  }, [result, showToast])

  const downloadJSON = useCallback(() => {
    if (!result) return
    const payload = {
      toneHex: result.toneHex,
      toneRgb: result.toneRgb,
      depth: result.depth,
      undertone: result.undertone,
      paletteKey: result.paletteKey,
      palette: result.palette,
      summary: result.summary,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "paletteiq-palette.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const downloadPNG = useCallback(async () => {
    if (!result) return
    const canvas = createPaletteDownloadCanvas(result, result.toneHex, result.summary)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "paletteiq-palette.png"
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [result])

  const currentPalette = result?.palette || paletteMap.medium_warm
  const currentTone = result?.toneHex || "#D7B39A"

  const landingContent = (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 text-[#2D2D2D] md:px-8">
      <div
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-black/5"
        aria-label="Model loading progress"
      >
        <div
          className="h-full rounded-full bg-[#D4748C] transition-all duration-500"
          style={{ width: `${loadProgress}%` }}
        />
      </div>

      <header className="grid gap-8 pt-5 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pt-10">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4748C]/20 bg-white/80 px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-[#A05B6B] shadow-sm">
            <Sparkles className="h-4 w-4" />
            PaletteIQ V2
          </div>
          <h1
            className="max-w-3xl text-[52px] leading-[0.96] text-[#2D2D2D] md:text-[78px]"
            style={{ fontFamily: "Georgia, Cambria, Times New Roman, serif" }}
          >
            Discover your colors.
          </h1>
          <p className="max-w-2xl text-[17px] leading-7 text-[#5E5451] md:text-[19px]">
            Upload a selfie or use your camera. PaletteIQ will analyze your skin tone locally in the browser and
            return a practical palette for wardrobe, makeup, and styling.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-[#D4748C] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(212,116,140,0.25)]"
            >
              <Upload className="h-4 w-4" />
              Upload photo
            </button>
            <button
              type="button"
              onClick={() => {
                setWebcamDenied(false)
                setWebcamActive(true)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4748C]/20 bg-white px-5 py-3 text-sm font-semibold text-[#2D2D2D] shadow-sm"
            >
              <Camera className="h-4 w-4" />
              Take photo
            </button>
            {result && (
              <button
                type="button"
                onClick={() => setMode("results")}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#2D2D2D] shadow-sm"
              >
                View results
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E7D8D3] bg-white/75 p-5 shadow-[0_24px_60px_rgba(45,45,45,0.06)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#A07F86]">Analysis engine</div>
              <div className="mt-1 text-[22px] font-semibold text-[#2D2D2D]">Client-side ML pipeline</div>
            </div>
            <div className="rounded-full bg-[#F8E7EC] px-3 py-1 text-[12px] font-medium text-[#A84A69]">
              {stackReady ? "Ready" : "Loading"}
            </div>
          </div>
          <div className="mt-5 grid gap-4 text-sm text-[#5A5150]">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#D4748C]" />
              <p>BlazeFace detects the face and landmarks.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#D4748C]" />
              <p>Skin zones are sampled from forehead, cheeks, and nose bridge.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#D4748C]" />
              <p>HSV filtering and K-means clustering estimate the representative tone.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-8 grid gap-5 md:grid-cols-2">
        <section
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="rounded-[28px] border border-dashed border-[#D6BFC5] bg-white/70 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 text-[#2D2D2D]">
            <Upload className="h-4 w-4 text-[#D4748C]" />
            <h2 className="text-[20px] font-semibold">Upload image</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#615957]">
            Drag and drop a JPEG or PNG here, or choose a file manually. The image is analyzed locally in your browser.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2D2D2D] px-4 py-3 text-sm font-semibold text-white"
            >
              <Upload className="h-4 w-4" />
              Choose file
            </button>
            <div className="text-xs text-[#8B7D7A]">Supported: JPEG, PNG</div>
          </div>
          {previewUrl && (
            <div className="mt-5 overflow-hidden rounded-[20px] border border-black/5 bg-[#FCF7F4]">
              <img src={previewUrl} alt="Preview" className="h-64 w-full object-cover" />
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[#E8D9DD] bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#2D2D2D]">
            <Camera className="h-4 w-4 text-[#D4748C]" />
            <h2 className="text-[20px] font-semibold">Use webcam</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#615957]">
            Capture a selfie directly from your camera. Permission is requested by the browser at the moment you start.
          </p>

          {webcamDenied ? (
            <div className="mt-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Camera permission was denied, so this mode is hidden for now.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {webcamActive ? (
                <div className="space-y-3">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="aspect-[4/5] w-full rounded-[22px] bg-black object-cover"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={captureFromWebcam}
                      className="inline-flex items-center gap-2 rounded-full bg-[#D4748C] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#2D2D2D]"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWebcamActive(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D4748C]/20 bg-[#FAF1F4] px-4 py-3 text-sm font-semibold text-[#8D445B]"
                >
                  <Camera className="h-4 w-4" />
                  Start camera
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {loadError && (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Model load failed
          </div>
          <div className="mt-1">{loadError}</div>
          <button
            type="button"
            onClick={() => {
              setLoadError("")
              setStackReady(false)
              setLoadProgress(15)
              loadAnalysisStack()
                .then(() => {
                  setStackReady(true)
                  setLoadProgress(100)
                })
                .catch((error) => setLoadError(error?.message || "Couldn't load the analysis model."))
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {uploadError && (
        <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {uploadError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onFileChange}
      />
      <canvas ref={hiddenImageCanvasRef} className="hidden" />
    </div>
  )

  const analysisOverlay = (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#FDF8F5]/92 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-[#E9D8DF] bg-white p-8 text-center shadow-[0_24px_80px_rgba(45,45,45,0.1)]">
        <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-[#D4748C]" />
        <div className="mt-5 text-[26px] font-semibold text-[#2D2D2D]" style={{ fontFamily: "Georgia, serif" }}>
          Analyzing
        </div>
        <div className="mt-2 text-sm text-[#6D6361]">{stage}</div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/5">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#D4748C]" />
        </div>
      </div>
    </div>
  )

  const resultView = result && (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-5 text-[#2D2D2D] md:px-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-[#9B7D85]">Results</div>
          <h2
            className="mt-1 text-[34px] font-semibold md:text-[48px]"
            style={{ fontFamily: "Georgia, Cambria, Times New Roman, serif" }}
          >
            {result.depth} · {result.undertone}
          </h2>
        </div>
        <button
          type="button"
          onClick={resetAnalysis}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
        >
          <RefreshCcw className="h-4 w-4" />
          Start over
        </button>
      </div>

      {analysisWarning && (
        <div className="mb-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Warning
          </div>
          <div className="mt-1">{analysisWarning}</div>
        </div>
      )}
      {analysisError && (
        <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {analysisError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5 rounded-[28px] border border-[#E8D9DD] bg-white/80 p-5 shadow-sm">
          <div className="space-y-3">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#A07F86]">Representative tone</div>
            <div
              className="h-[220px] w-full rounded-[24px] border border-black/5 shadow-sm"
              style={{ backgroundColor: currentTone }}
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[22px] font-semibold">{result.toneHex}</div>
                <div className="text-sm text-[#6B6160]">
                  {result.toneRgb.join(", ")} RGB
                </div>
              </div>
              <div className="rounded-full bg-[#FAE8EF] px-4 py-2 text-sm font-semibold text-[#9A4560]">
                {result.undertone} · {result.depth}
              </div>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#FCF8F6] p-4 text-sm leading-6 text-[#5D5552]">
            {result.summary}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyAllHex}
              className="inline-flex items-center gap-2 rounded-full bg-[#D4748C] px-4 py-3 text-sm font-semibold text-white"
            >
              <Copy className="h-4 w-4" />
              Copy all hex
            </button>
            <button
              type="button"
              onClick={downloadPNG}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#2D2D2D]"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={downloadJSON}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#2D2D2D]"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </button>
          </div>
        </aside>

        <section className="space-y-6 rounded-[28px] border border-[#E8D9DD] bg-white/80 p-5 shadow-sm">
          <SectionRow title="Wardrobe Staples" items={currentPalette.staples} onCopy={copyHex} />
          <SectionRow title="Accent Colors" items={currentPalette.accents} onCopy={copyHex} />
          <SectionRow title="Colors to Avoid" items={currentPalette.avoid} onCopy={copyHex} />
        </section>
      </div>

      <div className="mt-5 rounded-[28px] border border-[#E8D9DD] bg-white/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[#A07F86]">
          <Sparkles className="h-4 w-4" />
          Source
        </div>
        <div className="mt-2 text-sm text-[#5D5552]">{result.sourceLabel}</div>
      </div>

    </div>
  )

  const toastView = toast ? (
    <div
      className={`fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg ${
        toastKind === "error" ? "bg-red-600 text-white" : "bg-[#2D2D2D] text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4" />
        {toast}
      </div>
    </div>
  ) : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: APP_BG, color: APP_TEXT }}>
      {mode === "analysis" && loadingAnalysis && analysisOverlay}
      {mode !== "results" && landingContent}
      {mode === "results" && resultView}
      {toastView}
    </div>
  )
}
