import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToRgba} from "@uiw/color-convert"


export default function BrightnessPowerPanel() {
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 90, a: 1 });

  const onIlluminateClick = () => {
    // Handle illuminate click
  };

  useEffect(() => {
    // Update the color when HSVA changes
    const rgb = hsvaToRgba(hsva);
    console.log("Color changed:", { hsva, rgb });
  }, [hsva]);

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
      {/* Left: Brightness Slider */}
      <Box display="flex" alignItems="center" justifyContent="center" p={0}>
        <Slider
          orientation="vertical"
          value={brightness}
          onChange={(e, newValue) => setBrightness(newValue)}
          min={0}
          max={100}
          sx={{ height: 200 }}
        />
      </Box>
      {/* Right: Power, Illuminate, Color Wheel */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" sx={{ gap: 2 }}>
        {/* Power Button */}
        <IconButton
          onClick={() => setIsOn(!isOn)}
          size="large"
          sx={{ bgcolor: isOn ? "#4caf50" : "background.paper", borderRadius: "50%", boxShadow: 2 }}
        >
          <PowerSettingsNewIcon fontSize="large" />
        </IconButton>
        {/* Illuminate Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={onIlluminateClick}
          sx={{ width: "120px" }}
        >
          Illuminate
        </Button>
        {/* Color Wheel */}
        <Box width="100%" display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Wheel color={hsva} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />
        </Box>
      </Box>
    </Box>
  );
}