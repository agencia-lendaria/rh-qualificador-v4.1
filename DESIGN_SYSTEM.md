{
  "colors": {
    "dark": "#121212",
    "background": "#1E1E2F",
    "primary": "#4F46E5",
    "primary-dark": "#4338CA",
    "secondary": "#EC4899",
    "success": "#22C55E",
    "info": "#3B82F6",
    "brand-purple": "rgba(139, 92, 246, 0.2)",
    "brand-gray": "#9CA3AF",
    "brand-darker": "rgba(31, 41, 55, 0.5)",
    "border": "#374151",
    "text-primary": "#F9FAFB",
    "text-secondary": "#9CA3AF",
    "text-muted": "#6B7280",
    "background-glass": "rgba(255, 255, 255, 0.1)"
  },
  "typography": {
    "fontFamily": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem"
    },
    "fontWeights": {
      "medium": 500,
      "bold": 700
    },
    "lineHeights": {
      "normal": 1.5
    },
    "letterSpacings": {
      "wide": "0.05em",
      "wider": "0.1em",
      "uppercase": "0.1em"
    }
  },
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "px": "1px"
  },
  "components": [
    {
      "name": "nav",
      "styles": {
        "background": "rgba(255 255 255 / 0.1)",
        "padding": "1rem 1.5rem",
        "position": "sticky",
        "top": "0",
        "zIndex": 50,
        "backdropFilter": "blur(10px)",
        "display": "flex",
        "justifyContent": "space-between",
        "alignItems": "center",
        "boxShadow": "0 4px 30px rgba(0,0,0,0.1)"
      }
    },
    {
      "name": "button",
      "variants": {
        "nav-item": {
          "fontSize": "0.875rem",
          "color": "#9CA3AF",
          "background": "transparent",
          "border": "none",
          "display": "flex",
          "alignItems": "center",
          "gap": "0.5rem",
          "cursor": "pointer",
          "transition": "color 0.3s ease",
          "active": {
            "color": "#4F46E5"
          },
          "hover": {
            "color": "#4F46E5"
          }
        },
        "btn-modern": {
          "fontSize": "0.75rem",
          "padding": "0.5rem 0.75rem",
          "borderRadius": "0.5rem",
          "display": "inline-flex",
          "alignItems": "center",
          "gap": "0.25rem",
          "cursor": "pointer",
          "transition": "background-color 0.3s ease, color 0.3s ease",
          "btn-secondary": {
            "backgroundColor": "transparent",
            "border": "1px solid #4F46E5",
            "color": "#4F46E5",
            "hover": {
              "backgroundColor": "#4F46E5",
              "color": "#FFFFFF"
            }
          },
          "btn-success": {
            "backgroundColor": "#22C55E",
            "border": "none",
            "color": "#FFFFFF",
            "hover": {
              "backgroundColor": "#16A34A"
            }
          }
        }
      }
    },
    {
      "name": "card",
      "styles": {
        "background": "#1E1E2F",
        "borderRadius": "0.75rem",
        "padding": "1.5rem",
        "boxShadow": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        "transition": "transform 0.3s ease, box-shadow 0.3s ease",
        "hover": {
          "transform": "scale(1.05)",
          "boxShadow": "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)"
        }
      }
    },
    {
      "name": "status-badge",
      "variants": {
        "status-success": {
          "backgroundColor": "#22C55E",
          "color": "#FFFFFF",
          "borderRadius": "9999px",
          "padding": "0.125rem 0.5rem",
          "fontSize": "0.75rem",
          "display": "inline-flex",
          "alignItems": "center",
          "gap": "0.25rem",
          "border": "2px solid #1E1E2F"
        },
        "status-info": {
          "backgroundColor": "#3B82F6",
          "color": "#FFFFFF",
          "borderRadius": "9999px",
          "padding": "0.125rem 0.5rem",
          "fontSize": "0.75rem",
          "display": "inline-flex",
          "alignItems": "center",
          "gap": "0.25rem",
          "border": "2px solid #1E1E2F"
        }
      }
    },
    {
      "name": "input",
      "styles": {
        "backgroundColor": "rgba(31, 41, 55, 0.5)",
        "border": "1px solid rgba(139, 92, 246, 0.2)",
        "borderRadius": "0.5rem",
        "color": "#FFFFFF",
        "padding": "0.5rem 1rem",
        "fontSize": "0.875rem",
        "outline": "none",
        "placeholderColor": "#9CA3AF",
        "focus": {
          "borderColor": "#8B5CF6",
          "boxShadow": "0 0 0 3px rgba(139, 92, 246, 0.3)"
        }
      }
    },
    {
      "name": "select",
      "styles": {
        "backgroundColor": "rgba(31, 41, 55, 0.5)",
        "border": "1px solid rgba(139, 92, 246, 0.2)",
        "borderRadius": "0.5rem",
        "color": "#FFFFFF",
        "padding": "0.5rem 0.75rem",
        "fontSize": "0.875rem",
        "outline": "none",
        "focus": {
          "borderColor": "#8B5CF6",
          "boxShadow": "0 0 0 3px rgba(139, 92, 246, 0.3)"
        }
      }
    },
    {
      "name": "progress-bar",
      "styles": {
        "backgroundColor": "#374151",
        "borderRadius": "0.375rem",
        "height": "0.5rem",
        "overflow": "hidden"
      },
      "fill": {
        "backgroundColor": "#4F46E5",
        "height": "100%",
        "transition": "width 0.3s ease"
      }
    },
    {
      "name": "text",
      "variants": {
        "text-primary": {
          "color": "#F9FAFB"
        },
        "text-secondary": {
          "color": "#9CA3AF"
        },
        "text-muted": {
          "color": "#6B7280"
        },
        "text-white": {
          "color": "#FFFFFF"
        },
        "text-xs": {
          "fontSize": "0.75rem"
        },
        "text-sm": {
          "fontSize": "0.875rem"
        },
        "text-lg": {
          "fontSize": "1.125rem"
        },
        "text-xl": {
          "fontSize": "1.25rem"
        },
        "font-bold": {
          "fontWeight": 700
        },
        "font-medium": {
          "fontWeight": 500
        },
        "uppercase": {
          "textTransform": "uppercase"
        },
        "tracking-wide": {
          "letterSpacing": "0.05em"
        },
        "tracking-wider": {
          "letterSpacing": "0.1em"
        }
      }
    },
    {
      "name": "icon",
      "styles": {
        "stroke": "currentColor",
        "strokeWidth": 2,
        "strokeLinecap": "round",
        "strokeLinejoin": "round"
      },
      "sizes": {
        "small": "1rem",
        "medium": "1.5rem",
        "large": "2rem"
      }
    }
  ],
  "layout": {
    "container": {
      "maxWidth": "80rem",
      "margin": "0 auto",
      "padding": "0 1.5rem"
    },
    "grid": {
      "gap": "1.5rem",
      "columns": {
        "default": 1,
        "md": 2,
        "lg": 3,
        "xl": 4
      }
    },
    "flex": {
      "flexDirection": {
        "column": "column",
        "row": "row"
      },
      "alignItems": {
        "center": "center",
        "start": "flex-start",
        "end": "flex-end"
      },
      "justifyContent": {
        "between": "space-between",
        "center": "center"
      },
      "gap": {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem"
      }
    },
    "position": {
      "stickyTop": {
        "position": "sticky",
        "top": "0",
        "zIndex": 40
      },
      "stickyTopNav": {
        "position": "sticky",
        "top": "0",
        "zIndex": 50
      }
    }
  }
}