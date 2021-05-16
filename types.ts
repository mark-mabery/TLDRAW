import * as monaco from "monaco-editor/esm/vs/editor/editor.api"

import React from "react"

export interface Data {
  isReadOnly: boolean
  settings: {
    fontSize: number
    darkMode: boolean
  }
  camera: {
    point: number[]
    zoom: number
  }
  brush?: Bounds
  selectedIds: Set<string>
  pointedId?: string
  hoveredId?: string
  currentPageId: string
  currentCodeFileId: string
  document: {
    pages: Record<string, Page>
    code: Record<string, CodeFile>
  }
}

export interface CodeFile {
  id: string
  name: string
  code: string
}

export interface Page {
  id: string
  type: "page"
  childIndex: number
  name: string
  shapes: Record<string, Shape>
}

export enum ShapeType {
  Dot = "dot",
  Circle = "circle",
  Ellipse = "ellipse",
  Line = "line",
  Ray = "ray",
  Polyline = "polyline",
  Rectangle = "rectangle",
  // Glob = "glob",
  // Spline = "spline",
  // Cubic = "cubic",
  // Conic = "conic",
}

export interface BaseShape {
  id: string
  type: ShapeType
  parentId: string
  childIndex: number
  isGenerated: boolean
  name: string
  point: number[]
  rotation: number
  style: Partial<React.SVGProps<SVGUseElement>>
}

export interface DotShape extends BaseShape {
  type: ShapeType.Dot
}

export interface CircleShape extends BaseShape {
  type: ShapeType.Circle
  radius: number
}

export interface EllipseShape extends BaseShape {
  type: ShapeType.Ellipse
  radiusX: number
  radiusY: number
}

export interface LineShape extends BaseShape {
  type: ShapeType.Line
  direction: number[]
}

export interface RayShape extends BaseShape {
  type: ShapeType.Ray
  direction: number[]
}

export interface PolylineShape extends BaseShape {
  type: ShapeType.Polyline
  points: number[][]
}

export interface RectangleShape extends BaseShape {
  type: ShapeType.Rectangle
  size: number[]
}

export type Shape =
  | DotShape
  | CircleShape
  | EllipseShape
  | LineShape
  | RayShape
  | PolylineShape
  | RectangleShape

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface ShapeBounds extends Bounds {
  id: string
}

export interface PointSnapshot extends Bounds {
  nx: number
  nmx: number
  ny: number
  nmy: number
}

export interface BoundsSnapshot extends PointSnapshot {
  nw: number
  nh: number
}

export interface Shapes extends Record<ShapeType, Shape> {
  [ShapeType.Dot]: DotShape
  [ShapeType.Circle]: CircleShape
  [ShapeType.Ellipse]: EllipseShape
  [ShapeType.Line]: LineShape
  [ShapeType.Ray]: RayShape
  [ShapeType.Polyline]: PolylineShape
  [ShapeType.Rectangle]: RectangleShape
}

export type Difference<A, B> = A extends B ? never : A

export type ShapeSpecificProps<T extends Shape> = Pick<
  T,
  Difference<keyof T, keyof BaseShape>
>

export type ShapeIndicatorProps<T extends Shape> = ShapeSpecificProps<T>

export type ShapeUtil<K extends Shape> = {
  create(props: Partial<K>): K
  getBounds(shape: K): Bounds
  hitTest(shape: K, test: number[]): boolean
  hitTestBounds(shape: K, bounds: Bounds): boolean
  rotate(shape: K): K
  translate(shape: K, delta: number[]): K
  scale(shape: K, scale: number): K
  stretch(shape: K, scaleX: number, scaleY: number): K
  render(shape: K): JSX.Element
}

export interface PointerInfo {
  target: string
  pointerId: number
  origin: number[]
  point: number[]
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
}

export enum TransformEdge {
  Top = "top_edge",
  Right = "right_edge",
  Bottom = "bottom_edge",
  Left = "left_edge",
}

export enum TransformCorner {
  TopLeft = "top_left_corner",
  TopRight = "top_right_corner",
  BottomRight = "bottom_right_corner",
  BottomLeft = "bottom_left_corner",
}

export type IMonaco = typeof monaco

export type IMonacoEditor = monaco.editor.IStandaloneCodeEditor
