import { useState } from "react";

import { Box, Slider, Typography } from "@mui/material";


export default function GoveeControl() {
  const [brightness, setBrightness] = useState(50);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Brightness</Typography>
      <Slider
        orientation="vertical"
        value={brightness}
        onChange={(e, newValue) => setBrightness(newValue)}
        aria-labelledby="brightness-slider"
        min={0}
        max={100}
      />
    </Box>
  )
}