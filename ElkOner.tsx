import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Elk: React.FC = () => {
    const [data, setData] = useState<any[]>([]); // State to store Elasticsearch results
    const [loading, setLoading] = useState<boolean>(true); // State for loading status
    const [error, setError] = useState<string | null>(null); // State for error handling

    const fetchData = async () => {
        try {
            const response = await axios.post('/logstash-*/_search', {
                size: 5, // Number of results you want to retrieve
                query: {
                match_all: {}, // Simple query to get all results
                },
            });

            setData(response.data.hits.hits); // Update state with search hits
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data from Elasticsearch');
            console.error('Error fetching data from Elasticsearch:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Elastic Results Page!</h1>
            <p className="mt-4 text-lg">This should hopefully return some data when connected to the right endpoint.</p>

            {/* Conditional Rendering */}
            {loading && <p className="text-gray-500">Loading data...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">Fetched Data:</h2>
                <ul className="list-disc list-inside">
                    {data.map((item, index) => (
                    <li key={index} className="mb-2">
                        {JSON.stringify(item._source)} {/* Render Elasticsearch document */}
                    </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
    );
};
  
export default Elk;