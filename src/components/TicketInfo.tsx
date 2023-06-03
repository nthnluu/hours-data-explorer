import React from 'react';
import {Badge, HStack, ListItem, Spacer, Text} from "@chakra-ui/react";

interface Ticket {
    id: string;
    description: string;
    status: string;
    user: {
        UserID: string;
        DisplayName: string;
        Email: string;
    }
    createdAt: string;
}

const QueueComponent = ({ticket}: { ticket: Ticket }) => {
    const getTicketStatusColor = (status: string) => {
        if (status === 'MISSING') {
            return 'yellow';
        } else {
            return 'green';
        }
    }

    const formatDate = (dateString: string) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        // @ts-ignore
        return new Date(dateString).toLocaleString('en-US', options);
    };

    return (
        <ListItem key={ticket.id} p={2} borderWidth={1}>
            <HStack alignItems="start">
                <Text>
                    {ticket.description.length > 1 ? ticket.description :
                        <i>No description</i>}
                </Text>
                <Spacer/>
                <Badge colorScheme={getTicketStatusColor(ticket.status)}>
                    {ticket.status === "MISSING" ? "Missing" : "Complete"}
                </Badge>
            </HStack>

            <Text fontSize="xs">
                {ticket.user.DisplayName} ({ticket.user.Email})
            </Text>
            <Text fontSize="xs">
                Joined on {formatDate(ticket.createdAt)}
            </Text>

        </ListItem>
    );
};

export default QueueComponent;