<?php

namespace App\Http\Requests;

use App\Enums\CharacterClass;
use App\Enums\Races;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateCharacterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50',
            'race' => ['required', Rule::enum(Races::class)],
            'class' => ['required', Rule::enum(CharacterClass::class)],
        ];
    }
}
