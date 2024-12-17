# React + Tailwinds + ELK Metrics Idea

### Dependencies

This idea utilises the recharts and axios libraries (hopefully both available HS).

```bash
npm install axios
```

```bash
npm install recharts
```

### Axios

An example of an axios query against an ElasticSearch database can be seen below;

```jsx
import axios from "axios";

const fetchData = async () => {
    try {
        const response = await axios.post(
            "http://my-elasticsearch-server:9200/my-index/_search",
            {
                size: 0,
                aggs: {
                    runs_over_time: {
                            date_histogram: {
                            field: "timestamp",
                            calendar_interval: "day",
                        },
                        aggs: {
                            total_runs: { sum: { field: "runs" } },
                            unique_users: { cardinality: { field: "user_id" } },
                        },
                    },
                },
            },
            { headers: { "Content-Type": "application/json" } }
        );

        return response.data.aggregations.runs_over_time.buckets;
    } catch (error) {
        console.error("Error fetching Elasticsearch data:", error);
        return [];
    }
};
```

### Recharts

I chose recharts over react-chartjs-2, primarily due to just the sheer number of positive stars and recent reviews/articles. 

There's been consistent commits (latest was 2 days ago), it's built specifically for React, and it seems very responsive when used alongside API queries.

An example of a recharts area chart can be seen below;

```jsx
import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CCMetricsChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const buckets = await fetchCCData();
            const formattedData = buckets.map((bucket) => ({
                date: bucket.key_as_string,
                totalRuns: bucket.total_runs.value,
                uniqueUsers: bucket.unique_users.value,
            }));
            setData(formattedData);
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Application Metrics</h2>
            <AreaChart
                width={800}
                height={400}
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="totalRuns" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="uniqueUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
        </div>
    );
};

export default CCMetricsChart;
```
### Breaking down the code


Breaking this code down into segments helps understand the differences between React and a regular Python file.

```jsx
import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
{/* 
    useState - a React hook for managing state within functional components.
    useEffect - another React hook, but this lets you run side effects (e.g API calls) after rendering.

    State is React's way of keeping track of values that can change over time and trigger re-rendering when updated
    - so pretty useful for pulling from the CC overtime?
*/}

const [data, setData] = useState([]);
{/* 
    useState - initialises a piece of state called data, initially as just an empty list.
    setData is a function to update the 'data' state later.
*/}

useEffect(() => {
    {/*
        useEffect - this runs after the component renders. The empty list as the second argument ensures it only runs once - no idea?
    */}
    const fetchData = async () => {
    {/*
        fetchData - an asynchronous function that makes API call to the CC Elastic Database using axios.
        - obviously the variable names need changing to match our CC metric values
    */}
        try {
            const response = await axios.post("http://your-elasticsearch-server:9200/your-index/_search", {
                size: 0,
                aggs: {
                    runs_over_time: {
                        date_histogram: { field: "timestamp", calendar_interval: "day" },
                        aggs: {
                        total_runs: { sum: { field: "runs" } },
                        unique_users: { cardinality: { field: "user_id" } },
                        },
                    },
                },
            });

            const formattedData = response.data.aggregations.runs_over_time.buckets.map((bucket) => ({
                date: bucket.key_as_string,
                totalRuns: bucket.total_runs.value,
                uniqueUsers: bucket.unique_users.value,
            }));
            {/*
                formattedData - Elastic returns the data in a nested format
                - using the 'map' function reformats it into a dict
            */}

            setData(formattedData);
            {/*
                setData(formattedData) - setData then updates the state ('data') with the formatted elastic results.
            */}

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

  fetchData();
}, []);
```

```jsx
return (
    <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="totalRuns" stroke="#8884d8" fill="#8884d8" />
        <Area type="monotone" dataKey="uniqueUsers" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
    </ResponsiveContainer>
);

{/*
    ResponsiveContainer - this ensures the chart is responsive and adjusts its width to our parent container.
    AreaChart - The container for the area chart. It takes the 'data' variable as a prop.
    CartesianGrid - nothing fancy, just a simple grid for better readability.
    To Do - I need to see if I can replace the 'stroke' colours with tailwind ones like the bg-emerald-300 we used before
*/}
```

### Point to note

Don't forget to add the following line to the package.json file during local deployment / testing

```json
 "proxy": "https://demo.elastic.co:9200",

 ```