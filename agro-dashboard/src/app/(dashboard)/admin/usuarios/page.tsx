"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface User {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({ name: "", email: "", password: "", role: "user" });

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    const user = await createUser(newUser);
    setUsers([...users, user]);
  };

  const handleDelete = async (id?: string) => {
    if (id) {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Usuários</h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button>Adicionar Usuário</Button>
        </DialogTrigger>
        <DialogContent>
          <h2 className="text-xl font-bold">Novo Usuário</h2>
          <Input placeholder="Nome" onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <Input placeholder="Email" onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <Input placeholder="Senha" type="password" onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <Button onClick={handleCreate}>Salvar</Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button onClick={() => handleDelete(user.id)} className="bg-red-500">Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
