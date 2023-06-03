import React, {useRef, useState} from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Box,
    Button,
    HStack,
    Spacer,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogCloseButton,
    VStack,
    List,
    ListItem, Divider, Badge,
} from '@chakra-ui/react';
import TicketInfo from "@/components/TicketInfo";

function QueueTable({queues, itemsPerPage}: any) {
    const [sortConfig, setSortConfig] = useState({key: '', direction: ''});
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQueue, setSelectedQueue] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const cancelRef = useRef(null);

    // Calculate the total number of tickets for a queue
    const getTotalTickets = (queue: any) => queue.tickets.length;

    // Format date as "Month day, year at hh:mm am/pm"
    const formatDate = (dateString: any) => {
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

    // Sort the table based on the specified key and direction
    const sortTable = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    // Perform the sorting based on the sortConfig
    const sortedQueues = [...queues].sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'ascending'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        } else if (sortConfig.key === 'endedAt') {
            const aValue = new Date(a.endTime);
            const bValue = new Date(b.endTime);

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        } else if (sortConfig.key === 'tickets') {
            const aValue = getTotalTickets(a);
            const bValue = getTotalTickets(b);

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedQueues.length / itemsPerPage);

    // Go to previous page
    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    // Go to next page
    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    // Calculate the range of displayed items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedQueues.slice(indexOfFirstItem, indexOfLastItem);

    // Dialog handlers
    const openDialog = (queue: any) => {
        setSelectedQueue(queue);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setSelectedQueue(null);
        setIsDialogOpen(false);
    };



    return (
        <>
            <Table>
                <Thead>
                    <Tr>
                        <Th onClick={() => sortTable('name')} maxW="200px">
                            Name
                        </Th>
                        <Th onClick={() => sortTable('endedAt')} maxW="150px">
                            Ended At
                        </Th>
                        <Th onClick={() => sortTable('tickets')} maxW="100px">
                            Tickets
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentItems.map((queue) => (
                        <Tr key={queue.courseID} onClick={() => openDialog(queue)} cursor="pointer">
                            <Td maxW="200px" isTruncated>
                                {queue.title}
                            </Td>
                            <Td maxW="150px" isTruncated>
                                {formatDate(queue.endTime)}
                            </Td>
                            <Td maxW="100px" isTruncated>
                                {getTotalTickets(queue)}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <HStack p={4} justify="flex-end">
                <Text>
                    {currentPage} of {totalPages}
                </Text>
                <Spacer/>

                <Button
                    size="sm"
                    onClick={goToPreviousPage}
                    isDisabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    size="sm"
                    onClick={goToNextPage}
                    isDisabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </HStack>

            <AlertDialog
                isOpen={isDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={closeDialog}
                size="3xl"
                motionPreset="slideInBottom"
            >
                <AlertDialogOverlay/>
                <AlertDialogContent>
                    <AlertDialogHeader>Queue Details</AlertDialogHeader>
                    <AlertDialogCloseButton ref={cancelRef}/>
                    <AlertDialogBody>
                        {selectedQueue && (
                            <VStack align="start">
                                <Text>Title: {selectedQueue.title}</Text>
                                <Text>Ended At: {formatDate(selectedQueue.endTime)}</Text>
                                <Text>Total Tickets: {getTotalTickets(selectedQueue)}</Text>
                                <Divider/>
                                <List spacing={2} width="100%" overflowY="auto" maxH="lg">
                                    {/*@ts-ignore*/}
                                    {selectedQueue.tickets.map((ticket) => (
                                        <ListItem key={ticket.id}>
                                            <TicketInfo ticket={ticket}/>
                                        </ListItem>
                                    ))}
                                </List>
                            </VStack>
                        )}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button colorScheme="blue" onClick={closeDialog}>
                            Close
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default QueueTable;
