import { apiClient } from "@/lib/axios";

// Types for API responses
export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
  revenueGrowth: number;
  userGrowth: number;
}

// API service methods
export const apiService = {
  // Users
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get("/users");
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Posts
  async getPosts(): Promise<Post[]> {
    const response = await apiClient.get("/posts");
    return response.data;
  },

  async getPostsByUser(userId: number): Promise<Post[]> {
    const response = await apiClient.get(`/posts?userId=${userId}`);
    return response.data;
  },

  // Todos
  async getTodos(): Promise<Todo[]> {
    const response = await apiClient.get("/todos");
    return response.data;
  },

  async getTodosByUser(userId: number): Promise<Todo[]> {
    const response = await apiClient.get(`/todos?userId=${userId}`);
    return response.data;
  },

  // Dashboard analytics
  async getDashboardStats(): Promise<DashboardStats> {
    // Simulate dashboard stats from the API data
    const [users, posts, todos] = await Promise.all([
      this.getUsers(),
      this.getPosts(),
      this.getTodos(),
    ]);

    const completedTodos = todos.filter((todo) => todo.completed).length;
    const pendingTodos = todos.filter((todo) => !todo.completed).length;

    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      completedTodos,
      pendingTodos,
      revenueGrowth: Math.floor(Math.random() * 30) + 10, // Mock data
      userGrowth: Math.floor(Math.random() * 20) + 5, // Mock data
    };
  },

  // Chart data
  async getChartData() {
    // Generate mock chart data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      users: Math.floor(Math.random() * 500) + 200,
      orders: Math.floor(Math.random() * 200) + 50,
    }));
  },
};

export default apiService;
