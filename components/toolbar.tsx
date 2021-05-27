import state, { useSelector } from "state"
import styled from "styles"
import { Menu } from "react-feather"

export default function Toolbar() {
  const activeTool = useSelector((state) =>
    state.whenIn({
      selecting: "select",
      dot: "dot",
      circle: "circle",
      ellipse: "ellipse",
      ray: "ray",
      line: "line",
      polyline: "polyline",
      rectangle: "rectangle",
      draw: "draw",
    })
  )

  return (
    <ToolbarContainer>
      <Section>
        <Button>
          <Menu />
        </Button>
        <Button
          isSelected={activeTool === "select"}
          onClick={() => state.send("SELECTED_SELECT_TOOL")}
        >
          Select
        </Button>
        <Button
          isSelected={activeTool === "draw"}
          onClick={() => state.send("SELECTED_DRAW_TOOL")}
        >
          Draw
        </Button>
        <Button
          isSelected={activeTool === "dot"}
          onClick={() => state.send("SELECTED_DOT_TOOL")}
        >
          Dot
        </Button>
        <Button
          isSelected={activeTool === "circle"}
          onClick={() => state.send("SELECTED_CIRCLE_TOOL")}
        >
          Circle
        </Button>
        <Button
          isSelected={activeTool === "ellipse"}
          onClick={() => state.send("SELECTED_ELLIPSE_TOOL")}
        >
          Ellipse
        </Button>
        <Button
          isSelected={activeTool === "ray"}
          onClick={() => state.send("SELECTED_RAY_TOOL")}
        >
          Ray
        </Button>
        <Button
          isSelected={activeTool === "line"}
          onClick={() => state.send("SELECTED_LINE_TOOL")}
        >
          Line
        </Button>
        <Button
          isSelected={activeTool === "polyline"}
          onClick={() => state.send("SELECTED_POLYLINE_TOOL")}
        >
          Polyline
        </Button>
        <Button
          isSelected={activeTool === "rectangle"}
          onClick={() => state.send("SELECTED_RECTANGLE_TOOL")}
        >
          Rectangle
        </Button>
        <Button onClick={() => state.send("RESET_CAMERA")}>Reset Camera</Button>
      </Section>
      <Section>
        <Button onClick={() => state.send("UNDO")}>Undo</Button>
        <Button onClick={() => state.send("REDO")}>Redo</Button>
      </Section>
    </ToolbarContainer>
  )
}

const ToolbarContainer = styled("div", {
  gridArea: "toolbar",
  userSelect: "none",
  borderBottom: "1px solid black",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "$panel",
  gap: 8,
  fontSize: "$1",
  zIndex: 200,
})

const Section = styled("div", {
  whiteSpace: "nowrap",
  overflow: "hidden",
  display: "flex",
})

const Button = styled("button", {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  font: "$ui",
  fontSize: "$ui",
  height: "40px",
  outline: "none",
  borderRadius: 0,
  border: "none",
  padding: "0 12px",
  background: "none",
  "&:hover": {
    backgroundColor: "$hint",
  },
  "& svg": {
    height: 16,
    width: 16,
  },
  variants: {
    isSelected: {
      true: {
        color: "$selected",
      },
      false: {},
    },
  },
})
