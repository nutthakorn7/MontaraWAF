declare module 'react-simple-maps' {
    import React from 'react';

    export interface ComposableMapProps {
        projection?: string;
        projectionConfig?: {
            scale?: number;
            center?: [number, number];
            rotate?: [number, number, number];
        };
        width?: number;
        height?: number;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface ZoomableGroupProps {
        zoom?: number;
        center?: [number, number];
        onMoveStart?: (event: any) => void;
        onMove?: (event: any) => void;
        onMoveEnd?: (event: any) => void;
        children?: React.ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object;
        children: (data: { geographies: any[] }) => React.ReactNode;
    }

    export interface GeographyProps {
        geography: any;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        onMouseEnter?: (event: React.MouseEvent) => void;
        onMouseLeave?: (event: React.MouseEvent) => void;
        onClick?: (event: React.MouseEvent) => void;
    }

    export const ComposableMap: React.FC<ComposableMapProps>;
    export const ZoomableGroup: React.FC<ZoomableGroupProps>;
    export const Geographies: React.FC<GeographiesProps>;
    export const Geography: React.FC<GeographyProps>;
}
