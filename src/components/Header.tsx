import React from 'react';
import { BsWallet2 } from 'react-icons/bs';

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BsWallet2 className="text-2xl" />
          <h1 className="text-2xl font-bold">BudgetBookz</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <button className="hover:text-indigo-200">Dashboard</button>
            </li>
            <li>
              <button className="hover:text-indigo-200">Transactions</button>
            </li>
            <li>
              <button className="hover:text-indigo-200">Budgets</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}