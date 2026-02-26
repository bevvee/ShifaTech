<?php

namespace App\Processor;

// use ApiPlatform\Metadata\Operation;
// use ApiPlatform\State\ProcessorInterface;
// use Symfony\Contracts\HttpClient\HttpClientInterface;

// class RendezVousProcessor implements ProcessorInterface
// {
//     public function __construct(
//         private HttpClientInterface $httpClient
//     ) {}

//     public function process(
//         mixed $data,
//         Operation $operation,
//         array $uriVariables = [],
//         array $context = []
//     ) {
//         $method = $operation->getMethod();
//         $id = $uriVariables['id'] ?? null;

//         if ($method === 'POST') {
//             return $this->httpClient->request(
//                 'POST',
//                 'http://rendezvous-service/api/rendezvous',
//                 ['json' => $data]
//             )->toArray();
//         }

//         if ($method === 'PUT' && $id) {
//             return $this->httpClient->request(
//                 'PUT',
//                 'http://rendezvous-service/api/rendezvous/' . $id,
//                 ['json' => $data]
//             )->toArray();
//         }

//         if ($method === 'DELETE' && $id) {
//             return $this->httpClient->request(
//                 'DELETE',
//                 'http://rendezvous-service/api/rendezvous/' . $id
//             )->toArray();
//         }

//         return null;
//     }
// }
