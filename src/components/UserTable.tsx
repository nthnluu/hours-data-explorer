import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    HStack,
    Spacer,
    Text,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogCloseButton,
    AlertDialogBody,
    AlertDialogFooter,
    useDisclosure, Divider, List, ListItem,
} from "@chakra-ui/react";
import React, {useRef, useState} from "react";
import TicketInfo from "@/components/TicketInfo";

interface Queue {
    // Queue object properties
    // ...

    tickets: Ticket[];
}

interface Ticket {
    // Ticket object properties
    // ...
    user: User;
}

interface User {
    UserID: string;
    DisplayName: string;
    Email: string;
}

interface Props {
    queues: Queue[];
    itemsPerPage: number;
}

type SortDirection = "asc" | "desc";

const UserTable: React.FC<Props> = ({queues, itemsPerPage}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("DisplayName");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const cancelRef = useRef(null);

    // Generate a map of users based on their user ID
    const usersMap: Map<string, User> = new Map();

    // Count the number of tickets per user
    const ticketsCountMap: Map<string, number> = new Map();

    // Iterate through the queues to collect unique users and count their tickets
    queues.forEach((queue) => {
        queue.tickets.forEach((ticket) => {
            const userID = ticket.user.UserID;

            if (usersMap.has(userID)) {
                // User already exists, increment the ticket count
                const ticketCount = ticketsCountMap.get(userID) || 0;
                ticketsCountMap.set(userID, ticketCount + 1);
            } else {
                // New user, add to the users map and set the ticket count to 1
                usersMap.set(userID, ticket.user);
                ticketsCountMap.set(userID, 1);
            }
        });
    });

    // Convert the map of users to an array
    const users: User[] = Array.from(usersMap.values());

    // Sort the users array based on the current sort settings
    const sortedUsers = [...users].sort((a, b) => {
        const aValue = getColumnValue(a, sortBy);
        const bValue = getColumnValue(b, sortBy);

        if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
        } else {
            return 0;
        }
    });

    function getColumnValue(user: User, column: string): string | number {
        if (column === "Tickets") {
            return ticketsCountMap.get(user.UserID) || 0;
        } else {
            return user[column as keyof User] || "";
        }
    }

    // Calculate pagination indexes
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentUsers = sortedUsers.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (column: string) => {
        if (column === sortBy) {
            // If the same column is clicked again, reverse the sort direction
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // If a different column is clicked, set it as the new sort column and default to ascending order
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const handleRowClick = (user: User) => {
        setSelectedUser(user);
        onOpen();
    };

    return (
        <React.Fragment>
            <Table>
                <Thead>
                    <Tr>
                        <Th onClick={() => handleSort("DisplayName")}>Name</Th>
                        <Th onClick={() => handleSort("Email")}>Email</Th>
                        <Th onClick={() => handleSort("Tickets")}>Tickets</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentUsers.map((user) => (
                        <Tr key={user.UserID} onClick={() => handleRowClick(user)}>
                            <Td maxW="200px" isTruncated>
                                {user.DisplayName}
                            </Td>
                            <Td maxW="250px" isTruncated>
                                {user.Email}
                            </Td>
                            <Td>{ticketsCountMap.get(user.UserID)}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {selectedUser && (
                <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}
                             size="2xl"
                             motionPreset="slideInBottom">
                    <AlertDialogOverlay/>
                    <AlertDialogContent>
                        <AlertDialogHeader>User Info</AlertDialogHeader>
                        <AlertDialogCloseButton ref={cancelRef}/>
                        <AlertDialogBody>
                            <Text fontWeight="bold">User ID:</Text>
                            <Text>{selectedUser.UserID}</Text>
                            <Text fontWeight="bold">Name:</Text>
                            <Text>{selectedUser.DisplayName}</Text>
                            <Text fontWeight="bold">Email:</Text>
                            <Text>{selectedUser.Email}</Text>
                            <Divider/>
                            <List spacing={2} width="100%" overflowY="auto" maxH="lg" mt={2}>
                                {queues.map((queue) => (
                                    // @ts-ignore
                                    <React.Fragment key={queue.queue_id}>
                                        {/*@ts-ignore*/}
                                        {queue.tickets.filter(ticket => ticket.user.UserID === selectedUser?.UserID).map((ticket) => (
                                            // @ts-ignore
                                            <ListItem key={ticket.id}>
                                                {/*@ts-ignore*/}
                                                <TicketInfo ticket={ticket}/>
                                            </ListItem>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </List>

                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button colorScheme="blue" onClick={onClose}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <HStack p={4} justify="flex-end">
                <Text>
                    {currentPage} of {totalPages}
                </Text>
                <Spacer/>

                <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </HStack>
        </React.Fragment>
    );
};

export default UserTable;
``
