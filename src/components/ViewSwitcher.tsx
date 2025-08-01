// src/components/ViewSwitcher.tsx

import React from 'react';
import { useView } from '../contexts/ViewContext';
import { useGroups } from '../contexts/GroupContext';

export const ViewSwitcher = () => {
    const { view, setView } = useView();
    const { groups } = useGroups();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        if (value === 'personal') {
            setView({ type: 'personal' });
        } else {
            const selectedGroup = groups.find(g => g.id === value);
            if (selectedGroup) {
                setView({ type: 'group', groupId: selectedGroup.id, groupName: selectedGroup.name });
            }
        }
    };

    // 計算當前選中的值，以便 select 能夠正確顯示
    const selectedValue = view.type === 'group' ? view.groupId : 'personal';

    return (
        <div className="px-4 pt-4 pb-2">
            <select
                value={selectedValue}
                onChange={handleChange}
                className="w-full p-2 text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                <option value="personal">個人帳本</option>
                {groups.map(group => (
                    <option key={group.id} value={group.id}>
                        {group.name}
                    </option>
                ))}
            </select>
        </div>
    );
};