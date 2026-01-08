/**
 * Do not edit directly, this file was auto-generated.
 */

export default tokens;

declare interface DesignToken {
  value?: any;
  type?: string;
  comment?: string;
  name?: string;
  themeable?: boolean;
  attributes?: Record<string, unknown>;
  [key: string]: any;
}

declare const tokens: {
  font: {
    family: {
      sans: DesignToken;
      serif: DesignToken;
      mono: DesignToken;
    };
    weight: {
      light: DesignToken;
      regular: DesignToken;
      medium: DesignToken;
      semibold: DesignToken;
      bold: DesignToken;
    };
  };
  size: {
    "10": DesignToken;
    "20": DesignToken;
    "30": DesignToken;
    "40": DesignToken;
    "50": DesignToken;
    "60": DesignToken;
    "70": DesignToken;
    "80": DesignToken;
    "90": DesignToken;
  };
  "line-height": {
    "10": DesignToken;
    "20": DesignToken;
    "30": DesignToken;
    "40": DesignToken;
    "50": DesignToken;
  };
  color: {
    white: DesignToken;
    black: DesignToken;
    gray: {
      "5": DesignToken;
      "10": DesignToken;
      "30": DesignToken;
      "50": DesignToken;
      "70": DesignToken;
      "90": DesignToken;
    };
    blue: {
      "10": DesignToken;
      "30": DesignToken;
      "40": DesignToken;
      "50": DesignToken;
      "60": DesignToken;
      "70": DesignToken;
      "80": DesignToken;
    };
    red: {
      "50": DesignToken;
      "60": DesignToken;
    };
    gold: {
      "10": DesignToken;
      "20": DesignToken;
    };
    green: {
      "50": DesignToken;
    };
    brand: {
      primary: DesignToken;
      gold: DesignToken;
    };
    theme: {
      action: DesignToken;
      surface: DesignToken;
      text: {
        primary: DesignToken;
        secondary: DesignToken;
      };
      border: DesignToken;
    };
  };
  button: {
    primary: {
      background: {
        default: DesignToken;
        hover: DesignToken;
      };
      text: DesignToken;
    };
  };
};
