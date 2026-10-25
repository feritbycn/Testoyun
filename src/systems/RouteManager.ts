export interface RouteDefinition { id: string; from: string; to: string; distance: number; duration: number; fare: number; demand: number }
export const ROUTES: RouteDefinition[] = [
  { id: "coast", from: "Marmara Terminali", to: "Sahilova", distance: 86, duration: 8, fare: 780, demand: 82 },
  { id: "capital", from: "Marmara Terminali", to: "Başkentova", distance: 245, duration: 13, fare: 1650, demand: 68 },
  { id: "valley", from: "Sahilova", to: "Yeşilvadi", distance: 132, duration: 10, fare: 1120, demand: 75 }
];
export interface RouteSnapshot { currentRouteId: string; completed: string[]; totalCompleted: number }
export class RouteManager {
  currentRouteId: string;
  completed: string[];
  totalCompleted: number;
  constructor(snapshot?: Partial<RouteSnapshot>) {
    this.currentRouteId = ROUTES.some(r => r.id === snapshot?.currentRouteId) ? snapshot!.currentRouteId! : ROUTES[0].id;
    this.completed = snapshot?.completed ?? [];
    this.totalCompleted = snapshot?.totalCompleted ?? 0;
  }
  select(id: string) { if (ROUTES.some(r => r.id === id)) this.currentRouteId = id; }
  markCompleted(id: string) { this.completed.push(id); this.totalCompleted += 1; }
  snapshot(): RouteSnapshot { return { currentRouteId: this.currentRouteId, completed: this.completed, totalCompleted: this.totalCompleted }; }
}
