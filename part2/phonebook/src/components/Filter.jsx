import React from 'react'

export default function Filter({ searchTerm, handleSearchChange }) {
    return (
        <div>
            filter shown with:
            <input
                value={searchTerm}
                onChange={handleSearchChange}
            />
        </div>
    )
}
