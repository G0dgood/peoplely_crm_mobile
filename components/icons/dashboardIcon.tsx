import React from "react";
import { SvgXml } from "react-native-svg";

const icon = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.7274 20.4471C20.2716 19.1713 19.2672 18.0439 17.8701 17.2399C16.4729 16.4358 14.7611 16 13 16C11.2389 16 9.52706 16.4358 8.12991 17.2399C6.73276 18.0439 5.72839 19.1713 5.27259 20.4471" stroke="{color}" stroke-linecap="round"/>
<circle cx="13" cy="8" r="4" stroke="{secondaryColor}" stroke-linecap="round"/>
</svg>
`;

export const DashboardIcon = ({
  color,
  secondaryColor,
  size,
}: {
  color: string;
  secondaryColor: string;
  size: number;
}) => (
  <SvgXml
    xml={icon
      .replace("{color}", color)
      .replace("{secondaryColor}", secondaryColor)}
    width={size}
    height={size}
  />
);
