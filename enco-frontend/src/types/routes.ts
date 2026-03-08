import { ROUTES } from "../constants/routes";

type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export type {RouteName}