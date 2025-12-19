import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToRgba } from "@uiw/color-convert";

export default function GoveeControl() {
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 90, a: 1 });

  const ws = useRef(null);
  const lastCommandTime = useRef(0);

  // Connect to WebSocket on mount
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onmessage = (event) => console.log("Server response:", event.data);
    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
  }, []);

  // Send commands with 100ms throttle
  const sendCommand = (cmd) => {
    const now = Date.now();
    if (now - lastCommandTime.current >= 200) { // 200ms = 0.2s
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(cmd);
        lastCommandTime.current = now;
      } else {
        console.warn("WebSocket is not open");
      }
    }
  };

  const togglePower = () => {
    const newIsOn = !isOn;
    setIsOn(newIsOn);
    sendCommand(newIsOn ? "on" : "off");
  };

  const onIlluminateClick = () => {
    sendCommand("illuminate");
  };

  const handleBrightnessChange = (value) => {
    setBrightness(value);
    sendCommand(`brightness ${value}`);
  };

  const handleColorChange = (color) => {
    const newHsva = { ...hsva, ...color.hsva };
    setHsva(newHsva);
    const { r, g, b } = hsvaToRgba(newHsva);
    sendCommand(`color ${r} ${g} ${b}`);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: "#3d3d82ff",
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        gap: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" p={0}>
        <Slider
          orientation="vertical"
          value={brightness}
          onChange={(e, newValue) => handleBrightnessChange(newValue)}
          min={0}
          max={100}
          sx={{ height: 300 }}
        />
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" sx={{ gap: 2 }}>
        <IconButton
          onClick={togglePower}
          size="large"
          sx={{ bgcolor: isOn ? "#4caf50" : "background.paper", borderRadius: "50%", boxShadow: 2 }}
        >
          <PowerSettingsNewIcon fontSize="large" />
        </IconButton>

        <Button
          variant="contained"
          color="primary"
          onClick={onIlluminateClick}
          sx={{ width: "120px" }}
        >
          Illuminate
        </Button>

        <Box width="100%" display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Wheel color={hsva} onChange={handleColorChange} />
        </Box>
      </Box>
    </Box>
  );
}
