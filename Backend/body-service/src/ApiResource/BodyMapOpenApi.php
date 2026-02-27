<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use App\Controller\BodyMapController;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/body-map',
            controller: BodyMapController::class,
            read: false,
            paginationEnabled: false,
            openapi: new Operation(
                summary: 'Get full body map',
                description: 'Returns all body sections with parts',
            )
        ),
        new Get(
            uriTemplate: '/body-map/part-label',
            controller: BodyMapController::class,
            read: false,
            openapi: new Operation(
                summary: 'Get body part label',
                parameters: [
                    [
                        'name' => 'section',
                        'in' => 'query',
                        'required' => true,
                        'schema' => ['type' => 'string'],
                        'example' => 'HEAD',
                    ],
                    [
                        'name' => 'part',
                        'in' => 'query',
                        'required' => true,
                        'schema' => ['type' => 'string'],
                        'example' => 'EYE_LEFT',
                    ],
                ],
            )
        ),
    ]
)]
final class BodyMapOpenApi
{
}